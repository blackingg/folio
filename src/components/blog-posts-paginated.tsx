import BlurFade from "@/components/magicui/blur-fade";
import { BlogCard } from "@/components/blog-card";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

const POSTS_PER_PAGE = 6;
const BLUR_FADE_DELAY = 0.04;

interface Post {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string | null;
  slug: string;
  readingTime?: string;
}

interface Props {
  posts: Post[];
  page?: number;
  initialDelay?: number;
}

function pageHref(n: number) {
  return n === 1 ? "/blog" : `/blog?page=${n}`;
}

export function BlogPostsPaginated({ posts, page = 1, initialDelay = 0 }: Props) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <div className="scroll-mt-24">
      <div className="grid gap-10">
        {visiblePosts.map((post, id) => (
          <BlurFade
            delay={
              (currentPage === 1 ? initialDelay : 0) +
              BLUR_FADE_DELAY +
              id * 0.05
            }
            key={`${currentPage}-${post.slug}`}
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
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Blog pagination"
          className="mt-12 flex items-center justify-center gap-1"
        >
          {currentPage === 1 ? (
            <span
              aria-disabled="true"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-40"
            >
              <ChevronLeftIcon className="size-4" />
            </span>
          ) : (
            <Link
              href={pageHref(currentPage - 1)}
              aria-label="Previous page"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeftIcon className="size-4" />
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-md text-sm transition-colors",
                n === currentPage
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {n}
            </Link>
          ))}

          {currentPage === totalPages ? (
            <span
              aria-disabled="true"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-40"
            >
              <ChevronRightIcon className="size-4" />
            </span>
          ) : (
            <Link
              href={pageHref(currentPage + 1)}
              aria-label="Next page"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRightIcon className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
