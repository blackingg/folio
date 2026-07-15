import { getBlogPosts, getPlaylistsWithPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { NextResponse } from "next/server";
export const dynamic = "force-static";
export const revalidate = 86400;
export async function GET() {
  const baseUrl = DATA.url.replace(/\/$/, "");
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  let playlists: Awaited<ReturnType<typeof getPlaylistsWithPosts>> = [];
  try {
    posts = await getBlogPosts();
    playlists = await getPlaylistsWithPosts();
  } catch (e) {
    console.error("Sitemap: failed to read posts", e);
  }
  const newestPostDate = posts.length
    ? new Date(posts[0].updatedAt || posts[0].publishedAt).toISOString()
    : new Date().toISOString();
  const urls = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPostDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/3d`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...playlists.map((playlist) => ({
      url: `${baseUrl}/blog/playlist/${playlist.slug}`,
      lastModified: newestPostDate,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt).toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate",
    },
  });
}
