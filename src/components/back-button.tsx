"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref = "/blog" }: { fallbackHref?: string }) {
  const router = useRouter();

  const handleClick = () => {
    // Walking history is only right if we arrived from within the site.
    // Coming from a search engine or a shared link, "back" should mean the
    // blog index, not leaving the site (or doing nothing in a fresh tab).
    const cameFromSite =
      document.referrer !== "" &&
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1;

    if (cameFromSite) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
    >
      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
      Back
    </button>
  );
}
