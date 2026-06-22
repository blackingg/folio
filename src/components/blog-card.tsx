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
}

export function BlogCard({
  title = "Untitled",
  publishedAt = new Date().toISOString(),
  summary = "",
  image,
  slug,
  readingTime,
}: Props) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="block h-full"
    >
      <Card className="h-full overflow-hidden group hover:bg-muted/50 transition-all border-none shadow-none bg-transparent">
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
