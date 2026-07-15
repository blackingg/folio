// One-time backfill: converts a Medium account-data export (posts/*.html)
// into content/<slug>.mdx files with images downloaded to public/blog/<slug>/.
//
// Usage: node scripts/backfill-medium.mjs [path-to-export-posts-dir]
//   default posts dir: .medium-export/posts

import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";

const POSTS_DIR = process.argv[2] || path.join(".medium-export", "posts");
const CONTENT_DIR = "content";
const PUBLIC_BLOG_DIR = path.join("public", "blog");
const FEED_URL = "https://medium.com/feed/@odetundemubarak";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    if (i > 0) await sleep(2000 * 2 ** (i - 1));
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status} for ${url}`);
      if (res.status !== 429 && res.status < 500) break;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Medium exports code as <pre data-code-block-lang="x"><span class="pre--content">
// hljs spans with <br /> line breaks. Convert to a fenced block with the language.
turndown.addRule("mediumPre", {
  filter: "pre",
  replacement: (_content, node) => {
    const lang = node.getAttribute("data-code-block-lang") || "";
    const code = decodeEntities(
      node.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    ).replace(/\n{3,}/g, "\n\n");
    return `\n\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\n`;
  },
});

// Keep figure captions as emphasized text under the image.
turndown.addRule("figcaption", {
  filter: "figcaption",
  replacement: (content) => (content.trim() ? `\n\n*${content.trim()}*\n\n` : ""),
});

function firstParagraph(md) {
  const cleaned = md.replace(/```[\s\S]*?```/g, "");
  for (const line of cleaned.split("\n")) {
    const t = line.trim();
    if (!t || t === "* * *" || /^(#|>|-|\d+\\?\.|!\[)/.test(t)) continue;
    const plain = t
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[\\*_`]/g, "")
      .trim();
    if (plain.length > 40) return plain.slice(0, 250);
  }
  return "";
}

async function fetchKeywordsBySlug() {
  try {
    const res = await fetchWithRetry(FEED_URL);
    const xml = await res.text();
    const map = {};
    for (const item of xml.split("<item>").slice(1)) {
      const linkMatch = item.match(/<link>([^<]+)<\/link>/);
      if (!linkMatch) continue;
      const slug = linkMatch[1].split("/").pop().split("?")[0];
      const categories = [...item.matchAll(/<category>(?:<!\[CDATA\[)?([^\]<]+)/g)].map(
        (m) => m[1].trim(),
      );
      map[slug] = categories;
    }
    console.log("Fetched keywords from RSS feed for", Object.keys(map).length, "posts");
    return map;
  } catch (e) {
    console.warn("Could not fetch RSS feed for keywords (continuing without):", e.message);
    return {};
  }
}

async function downloadImage(url, destPath) {
  const hiRes = url.replace(/\/max\/\d+\//, "/max/1600/");
  let res;
  try {
    res = await fetchWithRetry(hiRes);
  } catch {
    // Hi-res variant may be throttled/missing; fall back to the original URL.
    res = await fetchWithRetry(url);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

async function convertPost(file, keywordsBySlug) {
  const html = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");

  const title = decodeEntities(
    (html.match(/<h1 class="p-name">([\s\S]*?)<\/h1>/) || [])[1]?.trim() || "",
  );
  const canonical = (html.match(/<a href="([^"]+)" class="p-canonical">/) || [])[1];
  const publishedAt = (html.match(/class="dt-published" datetime="([^"]+)"/) || [])[1];
  if (!title || !canonical || !publishedAt) {
    throw new Error(`Missing title/canonical/date in ${file}`);
  }
  const slug = canonical.split("/").pop().split("?")[0];

  const subtitleMatch = html.match(
    /<section data-field="subtitle" class="p-summary">([\s\S]*?)<\/section>/,
  );
  const subtitle = subtitleMatch ? stripTags(subtitleMatch[1]) : "";

  const bodyMarker = '<section data-field="body" class="e-content">';
  const start = html.indexOf(bodyMarker);
  const end = html.indexOf("<footer>");
  if (start === -1 || end === -1) throw new Error(`Missing body in ${file}`);
  let body = html.slice(start + bodyMarker.length, end);

  // The body repeats the title as an <h3 class="... graf--title">; drop it,
  // along with any subtitle h4, since the page renders the frontmatter title.
  body = body
    .replace(/<h3[^>]*graf--title[^>]*>[\s\S]*?<\/h3>/, "")
    .replace(/<h4[^>]*graf--subtitle[^>]*>[\s\S]*?<\/h4>/, "");

  // Download images locally and rewrite srcs.
  const imageUrls = [...body.matchAll(/src="(https:\/\/cdn-images-1\.medium\.com\/[^"]+)"/g)].map(
    (m) => m[1],
  );
  let firstLocalImage = null;
  for (const url of imageUrls) {
    const filename = url.split("/").pop().replace(/[^a-zA-Z0-9.-]/g, "-");
    const localPath = `/blog/${slug}/${filename}`;
    const destPath = path.join(PUBLIC_BLOG_DIR, slug, filename);
    try {
      const bytes = fs.existsSync(destPath)
        ? fs.statSync(destPath).size
        : await downloadImage(url, destPath);
      console.log(`  image ${filename} (${(bytes / 1024).toFixed(0)} KB)`);
      body = body.replaceAll(url, localPath);
      if (!firstLocalImage) firstLocalImage = localPath;
      await sleep(1000);
    } catch (e) {
      // Keep the remote CDN URL rather than losing the image entirely.
      console.warn(`  image ${filename} download failed (${e.message}); keeping CDN URL`);
      if (!firstLocalImage) firstLocalImage = url;
    }
  }

  let markdown = turndown
    .turndown(body)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/^(?:\* \* \*\s*)+/, "");

  // Medium subtitles are often just a heading fragment; prefer the first real
  // paragraph as the summary/description when the subtitle is too short.
  const summary =
    subtitle.length >= 80 ? subtitle : firstParagraph(markdown) || subtitle;
  const keywords = keywordsBySlug[slug] || [];

  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `publishedAt: ${JSON.stringify(publishedAt)}`,
    `summary: ${JSON.stringify(summary)}`,
    ...(firstLocalImage ? [`image: ${JSON.stringify(firstLocalImage)}`] : []),
    ...(keywords.length
      ? [`keywords:`, ...keywords.map((k) => `  - ${JSON.stringify(k)}`)]
      : []),
    `mediumLink: ${JSON.stringify(canonical)}`,
    "---",
  ].join("\n");

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const outPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  fs.writeFileSync(outPath, `${fm}\n\n${markdown}\n`, "utf-8");
  console.log(`  -> ${outPath}`);
}

const files = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".html") && !f.startsWith("draft_"));
console.log(`Found ${files.length} published posts in ${POSTS_DIR}`);

const keywordsBySlug = await fetchKeywordsBySlug();
let failures = 0;
for (const file of files) {
  console.log(`Converting ${file}`);
  try {
    await convertPost(file, keywordsBySlug);
  } catch (e) {
    failures++;
    console.error(`  FAILED: ${e.message}`);
  }
}
console.log(failures ? `Done with ${failures} failure(s)` : "Done");
process.exit(failures ? 1 : 0);
