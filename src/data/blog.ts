import fs from "fs";
// @ts-ignore
import matter from "gray-matter";
import path from "path";
import rehypeParse from "rehype-parse";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import Parser from "rss-parser";
import { visit } from "unist-util-visit";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  mediumLink?: string;
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

export async function highlightHTML(html: string) {
  const p = await unified()
    .use(rehypeParse, { fragment: true })
    .use(() => (tree) => {
      visit(tree, "element", (node: any) => {
        if (node.tagName === "pre") {
          let codeNode = node.children.find(
            (child: any) => child.tagName === "code"
          );

          if (!codeNode) {
            codeNode = {
              type: "element",
              tagName: "code",
              properties: {},
              children: node.children,
            };
            node.children = [codeNode];
          }

          // Convert <br> to newlines and flatten text
          const text: string[] = [];
          const collectText = (n: any) => {
            if (n.type === "text") {
              text.push(n.value);
            } else if (n.tagName === "br") {
              text.push("\n");
            } else if (n.children) {
              n.children.forEach(collectText);
            }
          };

          codeNode.children.forEach(collectText);
          codeNode.children = [{ type: "text", value: text.join("") }];

          // Add a default language class if none exists
          if (!codeNode.properties.className) {
            codeNode.properties.className = ["language-javascript"];
          }
        }
      });
    })
    .use(rehypePrettyCode, {
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(html);

  return p.toString();
}

type Post = {
  source: string;
  metadata: Metadata;
  slug: string;
};

async function getAllPosts(dir: string): Promise<Post[]> {
  let mdxFiles = getMDXFiles(dir);
  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      let slug = path.basename(file, path.extname(file));
      return await getPost(slug);
    })
  );
  return posts.filter((post): post is Post => post !== null);
}

export async function getBlogPosts() {
  const localPosts = await getAllPosts(path.join(process.cwd(), "content"));

  let mediumPosts: any[] = [];
  try {
    const parser = new Parser({
      customFields: {
        item: ["content:encoded"],
      },
    });
    const feed = await parser.parseURL(
      "https://medium.com/feed/@odetundemubarak"
    );
    mediumPosts = feed.items.map((item: any) => {
      const content = item["content:encoded"] || "";
      const imageMatch = content.match(/<img[^>]+src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : null;

      const textContent = content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const preview =
        textContent.slice(0, 250) + (textContent.length > 250 ? "..." : "");

      const linkParts = item.link.split("/");
      const slug = linkParts[linkParts.length - 1].split("?")[0];

      return {
        title: item.title || "Untitled",
        link: item.link || "#",
        publishedAt: item.pubDate || new Date().toISOString(),
        summary: preview,
        image,
        slug,
      };
    });
  } catch (error) {
    console.error("Error fetching Medium posts:", error);
  }

  const allPosts = [
    ...localPosts.map((p: Post) => ({
      title: p.metadata.title,
      publishedAt: p.metadata.publishedAt,
      summary: p.metadata.summary,
      image: p.metadata.image,
      slug: p.slug,
    })),
    ...mediumPosts,
  ];

  return allPosts.sort((a: any, b: any) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });
}

export async function getPost(slug: string): Promise<Post | null> {
  const localFilePath = path.join(process.cwd(), "content", `${slug}.mdx`);
  if (fs.existsSync(localFilePath)) {
    let source = fs.readFileSync(localFilePath, "utf-8");
    const { content: rawContent, data: metadata } = matter(source);
    const content = await markdownToHTML(rawContent);
    return {
      source: content,
      metadata: metadata as Metadata,
      slug,
    };
  }

  const posts = await getBlogPosts();
  const mediumPost = posts.find((p: any) => p.slug === slug);

  if (mediumPost) {
    const parser = new Parser({
      customFields: {
        item: ["content:encoded"],
      },
    });
    const feed = await parser.parseURL(
      "https://medium.com/feed/@odetundemubarak"
    );
    const feedItem = feed.items.find((item: any) => {
      const linkParts = item.link.split("/");
      const itemSlug = linkParts[linkParts.length - 1].split("?")[0];
      return itemSlug === slug;
    });

    if (feedItem) {
      const rawContent = feedItem["content:encoded"] || "";
      const content = await highlightHTML(rawContent);
      return {
        source: content,
        metadata: {
          title: feedItem.title || "Untitled",
          publishedAt: feedItem.pubDate || new Date().toISOString(),
          summary: mediumPost.summary,
          image: mediumPost.image || undefined,
          mediumLink: feedItem.link,
        },
        slug,
      };
    }
  }

  return null;
}
