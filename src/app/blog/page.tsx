import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts, getPlaylistsWithPosts } from "@/data/blog";
import { BlogPostsPaginated } from "@/components/blog-posts-paginated";
import { PlaylistCard } from "@/components/playlist-card";
import { Suspense } from "react";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

export const revalidate = 3600;

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const playlists = await getPlaylistsWithPosts();

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-6 tracking-tighter">Blog</h1>
      </BlurFade>

      {playlists.length > 0 && (
        <div className="mb-16 -mx-6">
          <div className="flex overflow-x-auto overflow-y-visible pt-12 pb-6 px-6 gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {playlists.map((playlist, idx) => {
              const images = playlist.posts
                .map((p) => p.image)
                .filter(Boolean)
                .slice(0, 3);

              return (
                <BlurFade
                  delay={BLUR_FADE_DELAY * 2 + idx * 0.05}
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
        <Suspense>
          <BlogPostsPaginated
            posts={posts}
            initialDelay={BLUR_FADE_DELAY * 2 + playlists.length * 0.05}
          />
        </Suspense>
      )}
    </section>
  );
}
