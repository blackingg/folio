import { formatDate } from "@/lib/utils";
import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

export const dynamic = "force-dynamic";

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
                <Link href={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                    {post.image && (
                      <div className="relative w-full h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader className="p-5 sm:p-6 pb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription
                        suppressHydrationWarning
                        className="text-sm"
                      >
                        {formatDate(post.publishedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 pt-0">
                      <p className="text-base text-foreground/80 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </BlurFade>
            ))
        )}
      </div>
    </section>
  );
}
