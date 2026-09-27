import { BlogImage } from "@/components/blog-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Props {
  title?: string;
  publishedAt?: string;
  summary?: string;
  image?: string | null;
  slug: string;
  readingTime?: string;
  compact?: boolean;
}

export function BlogCard({
  title = "Untitled",
  publishedAt = new Date().toISOString(),
  summary = "",
  image,
  slug,
  readingTime,
  compact = false,
}: Props) {
  const meta = (
    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
      <span>{formatDate(publishedAt)}</span>
      {readingTime && (
        <>
          <span>&bull;</span>
          <span>{readingTime}</span>
        </>
      )}
    </div>
  );

  if (compact) {
    return (
      <Link
        href={`/blog/${slug}`}
        className="block h-full"
      >
        <Card className="group h-full border-none bg-[color-mix(in_srgb,hsl(var(--muted))_40%,hsl(var(--background)))] shadow-none transition-all hover:bg-[color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))]">
          <div className="flex items-start gap-3 p-4">
            <BlogImage
              src={image || undefined}
              alt={title}
              compact
            />
            <div className="min-w-0 flex-1">
              {meta}
              <CardTitle className="text-base leading-snug transition-colors line-clamp-2 group-hover:text-primary">
                {title}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {summary}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${slug}`}
      className="block h-full"
    >
      <Card className="h-full overflow-hidden group transition-all border-none shadow-none bg-[color-mix(in_srgb,hsl(var(--muted))_40%,hsl(var(--background)))] hover:bg-[color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))]">
        <BlogImage
          src={image || undefined}
          alt={title}
        />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{formatDate(publishedAt)}</span>
            {readingTime && (
              <>
                <span>•</span>
                <span>{readingTime}</span>
              </>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
