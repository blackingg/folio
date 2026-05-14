import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { BlogCard } from "@/components/blog-card";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

export const revalidate = 3600;

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">Blog</h1>
      </BlurFade>
      <div className="grid gap-10">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        ) : (
          posts
            .sort((a: any, b: any) => {
              if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
                return -1;
              }
              return 1;
            })
            .map((post: any, id: number) => (
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
