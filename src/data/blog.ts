import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import Parser from "rss-parser";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

type MediumPost = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
};

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

export async function getPost(slug: string) {
  const filePath = path.join("content", `${slug}.mdx`);
  let source = fs.readFileSync(filePath, "utf-8");
  const { content: rawContent, data: metadata } = matter(source);
  const content = await markdownToHTML(rawContent);
  return {
    source: content,
    metadata,
    slug,
  };
}

async function getAllPosts(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return Promise.all(
    mdxFiles.map(async (file) => {
      let slug = path.basename(file, path.extname(file));
      let { metadata, source } = await getPost(slug);
      return {
        metadata,
        slug,
        source,
      };
    })
  );
}

export async function getBlogPosts() {
  try {
    const parser = new Parser({
      customFields: {
        item: ['content:encoded'],
      },
    });
    const feed = await parser.parseURL('https://medium.com/feed/@odetundemubarak');
    return feed.items.map((item: any) => {
      // Extract image from content:encoded
      const content = item['content:encoded'] || '';
      const imageMatch = content.match(/<img[^>]+src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : null;
      
      // Extract preview text (strip HTML and limit length)
      const textContent = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const preview = textContent.slice(0, 250) + (textContent.length > 250 ? '...' : '');
      
      return {
        title: item.title || 'Untitled',
        link: item.link || '#',
        publishedAt: item.pubDate || new Date().toISOString(),
        summary: preview,
        image,
      };
    });
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
}
