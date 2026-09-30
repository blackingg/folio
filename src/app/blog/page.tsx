import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts, getPlaylistsWithPosts } from "@/data/blog";
import { BlogPostsPaginated } from "@/components/blog-posts-paginated";
import { BlogDoodle } from "@/components/blog-doodle";
import { PlaylistCard } from "@/components/playlist-card";
import { PinnedPostCard } from "@/components/pinned-post-card";
import { PINNED_POST_SLUGS } from "@/data/playlists";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    title: "Blog",
    description: "My thoughts on software development, life, and more.",
    url: "/blog",
    type: "website",
  },
};

export const revalidate = 3600;

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const posts = await getBlogPosts();
  const playlists = await getPlaylistsWithPosts();

  // Kept in the order the slugs are listed, not publish order, so the pinning
  // is a deliberate running order.
  const pinned = PINNED_POST_SLUGS.map((slug) =>
    posts.find((post) => post.slug === slug),
  ).filter((post): post is NonNullable<typeof post> => Boolean(post));

  const rawPage = parseInt(searchParams?.page ?? "1", 10);
  const page = Number.isNaN(rawPage) ? 1 : rawPage;

  return (
    <section>
      <BlogDoodle className="doodle-draw pointer-events-none fixed -bottom-10 -right-10 -z-10 size-96 rotate-6 text-foreground sm:size-[36rem]" />
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-6 tracking-tighter">Blog</h1>
      </BlurFade>

      {(playlists.length > 0 || pinned.length > 0) && (
        <div className="mb-16 -mx-6">
          <div className="flex overflow-x-auto overflow-y-visible pt-12 pb-6 px-6 gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {pinned.map((post, idx) => (
              <BlurFade
                delay={BLUR_FADE_DELAY * 2 + idx * 0.05}
                key={post.slug}
                className="overflow-visible"
                blur="0px"
              >
                <PinnedPostCard
                  slug={post.slug}
                  title={post.title}
                  image={post.image}
                  readingTime={post.readingTime}
                />
              </BlurFade>
            ))}

            {playlists.map((playlist, idx) => {
              const images = playlist.posts
                .map((p) => p.image)
                .filter(Boolean)
                .slice(0, 3);

              return (
                <BlurFade
                  delay={BLUR_FADE_DELAY * 2 + (pinned.length + idx) * 0.05}
                  key={playlist.slug}
                  className="overflow-visible"
                  blur="0px"
                >
                  <PlaylistCard
                    slug={playlist.slug}
                    title={playlist.title}
                    postCount={playlist.posts.length}
                    images={images}
                  />
                </BlurFade>
              );
            })}
          </div>
        </div>
      )}

      <BlurFade delay={BLUR_FADE_DELAY * 2 + playlists.length * 0.05}>
        <h2 className="font-medium text-xl mb-6 tracking-tighter">All Posts</h2>
      </BlurFade>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          No blog posts available at the moment.
        </p>
      ) : (
        <BlogPostsPaginated
          posts={posts}
          page={page}
          initialDelay={BLUR_FADE_DELAY * 2 + playlists.length * 0.05}
        />
      )}
    </section>
  );
}
