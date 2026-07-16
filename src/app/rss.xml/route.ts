import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { NextResponse } from "next/server";
export const dynamic = "force-static";
export const revalidate = 86400;

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = DATA.url.replace(/\/$/, "");
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    posts = await getBlogPosts();
  } catch (e) {
    console.error("RSS: failed to read posts", e);
  }

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`;
      const categories = (post.keywords || [])
        .map((k) => `      <category>${escapeXml(k)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
${categories ? `${categories}\n` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${DATA.name} | Blog`)}</title>
    <link>${baseUrl}/blog</link>
    <description>My thoughts on software development, life, and more.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate",
    },
  });
}
