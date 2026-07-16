import fs from "fs";
// @ts-ignore
import matter from "gray-matter";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { PLAYLISTS } from "./playlists";

type Metadata = {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  image?: string;
  mediumLink?: string;
  keywords?: string[];
  readingTime?: string;
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
      // Single dark theme: prose gives code blocks a dark background in both
      // light and dark mode, so light-mode token colors were unreadable.
      theme: "min-dark",
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

export function calculateReadingTime(content: string) {
  // Remove HTML tags to ensure word count only includes visible text
  const text = content.replace(/<[^>]+>/g, " ");

  // Account for images as they add to the total reading experience
  const imageCount = (content.match(/<img|!\[/g) || []).length;

  const wordsPerMinute = 225;
  const noOfWords = text.trim().split(/\s+/).length;
  let minutes = noOfWords / wordsPerMinute;

  // Add additional time for each image, using a staggered approach
  // where the time per image decreases as the reader encounters more of them
  if (imageCount > 0) {
    let imageTime = 0;
    for (let i = 1; i <= imageCount; i++) {
      imageTime += Math.max(3, 13 - i);
    }
    minutes += imageTime / 60;
  }

  const readTime = Math.max(1, Math.ceil(minutes));
  return `${readTime} min read`;
}

type Post = {
  source: string;
  metadata: Metadata;
  slug: string;
};

export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const source = fs.readFileSync(filePath, "utf-8");
  const { content: rawContent, data: metadata } = matter(source);
  const content = await markdownToHTML(rawContent);
  return {
    source: content,
    metadata: {
      ...metadata,
      readingTime: calculateReadingTime(rawContent),
    } as Metadata,
    slug,
  };
}

export async function getBlogPosts() {
  const dir = path.join(process.cwd(), "content");
  const posts = getMDXFiles(dir).map((file) => {
    const slug = path.basename(file, path.extname(file));
    const source = fs.readFileSync(path.join(dir, file), "utf-8");
    const { content: rawContent, data: metadata } = matter(source);
    return {
      title: metadata.title as string,
      publishedAt: metadata.publishedAt as string,
      updatedAt: metadata.updatedAt as string | undefined,
      summary: metadata.summary as string,
      image: metadata.image as string | undefined,
      keywords: (metadata.keywords || []) as string[],
      slug,
      readingTime: calculateReadingTime(rawContent),
    };
  });

  return posts.sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });
}

export type PlaylistWithPosts = {
  slug: string;
  title: string;
  description: string;
  posts: any[];
};

export async function getPlaylistsWithPosts(): Promise<PlaylistWithPosts[]> {
  const allPosts = await getBlogPosts();

  return PLAYLISTS.map((playlistConfig) => {
    // Filter and order posts based on postSlugs array
    const playlistPosts = playlistConfig.postSlugs
      .map((slug) => allPosts.find((post) => post.slug === slug))
      .filter((post) => post !== undefined);

    return {
      slug: playlistConfig.slug,
      title: playlistConfig.title,
      description: playlistConfig.description,
      posts: playlistPosts,
    };
  }).filter((playlist) => playlist.posts.length > 0);
}
