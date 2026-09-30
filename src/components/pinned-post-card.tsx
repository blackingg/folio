import { Pin } from "lucide-react";
import Link from "next/link";

interface PinnedPostCardProps {
  slug: string;
  title: string;
  image?: string;
  readingTime?: string;
}

export function PinnedPostCard({
  slug,
  title,
  image,
  readingTime,
}: PinnedPostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block w-48 shrink-0 snap-start sm:w-56"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/60 bg-muted dark:bg-neutral-900 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-black dark:via-black/55 dark:to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-neutral-900 backdrop-blur-sm dark:bg-black/70 dark:text-white">
          <Pin className="size-3" />
          Pinned
        </span>

        <div className="absolute inset-x-3 bottom-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-neutral-900 dark:text-white">
            {title}
          </h3>
          {readingTime && (
            <p className="mt-0.5 text-[10px] text-neutral-600 dark:text-white/70">
              {readingTime}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
