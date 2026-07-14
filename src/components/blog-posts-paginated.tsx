"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { BlogCard } from "@/components/blog-card";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

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
  initialDelay?: number;
}

export function BlogPostsPaginated({ posts, initialDelay = 0 }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Math.min(Math.max(Number.isNaN(rawPage) ? 1 : rawPage, 1), totalPages);

  const start = (page - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const goToPage = (target: number) => {
    if (target === page || target < 1 || target > totalPages) return;
    router.push(target === 1 ? "/blog" : `/blog?page=${target}`, {
      scroll: false,
    });
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={listRef} className="scroll-mt-24">
      <div className="grid gap-10">
        {visiblePosts.map((post, id) => (
          <BlurFade
            delay={(page === 1 ? initialDelay : 0) + BLUR_FADE_DELAY + id * 0.05}
            key={`${page}-${post.slug}`}
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
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeftIcon className="size-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goToPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-md text-sm transition-colors",
                n === page
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
