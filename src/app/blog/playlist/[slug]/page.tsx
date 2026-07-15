import BlurFade from "@/components/magicui/blur-fade";
import { getPlaylistsWithPosts } from "@/data/blog";
import { BlogCard } from "@/components/blog-card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const playlists = await getPlaylistsWithPosts();
  return playlists.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const playlists = await getPlaylistsWithPosts();
  const playlist = playlists.find((p) => p.slug === params.slug);

  if (!playlist) return;

  return {
    title: playlist.title,
    description: playlist.description,
    alternates: {
      canonical: `/blog/playlist/${playlist.slug}`,
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
    openGraph: {
      title: playlist.title,
      description: playlist.description,
      url: `/blog/playlist/${playlist.slug}`,
      type: "website",
    },
  };
}

const BLUR_FADE_DELAY = 0.04;

export default async function PlaylistPage({
  params,
}: {
  params: { slug: string };
}) {
  const playlists = await getPlaylistsWithPosts();
  const playlist = playlists.find((p) => p.slug === params.slug);

  if (!playlist) {
    notFound();
  }

  return (
    <section>
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>
      </div>

      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="capitalize font-medium text-3xl mb-2 tracking-tighter">
          {playlist.title}
        </h1>
        <p className="text-muted-foreground mb-10 text-md">
          {playlist.description}
        </p>
      </BlurFade>

      <div className="grid gap-10">
        {playlist.posts.length === 0 ? (
          <p className="text-muted-foreground">
            No blog posts available in this playlist.
          </p>
        ) : (
          playlist.posts.map((post: any, id: number) => (
            <BlurFade
              delay={BLUR_FADE_DELAY * 2 + id * 0.05}
              key={post.slug}
            >
              <BlogCard
                title={post.title}
                publishedAt={post.publishedAt}
                summary={post.summary}
                image={post.image}
                slug={post.slug}
                readingTime={post.readingTime}
              />
            </BlurFade>
          ))
        )}
      </div>
    </section>
  );
}
