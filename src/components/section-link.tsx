import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// The "see everything in this section" link, shared by Work, Projects and
// Blog. Lives in one place because all three had drifted into different
// treatments — two filled buttons and a bare text link — and a filled
// button is the wrong weight for these pages anyway: every section is
// already minimal, so the CTA reads as chrome rather than emphasis.
// The underline sweeps in from the left and the arrow slides out, which
// gives it presence on hover without any resting box.
export function SectionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
      </span>
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
