import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section
      id="404"
      className="mx-auto w-full max-w-3xl space-y-8 flex flex-col justify-center min-h-[calc(100vh-250px)]"
    >
      <div className="space-y-4">
        <BlurFade delay={0.04}>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-red-500 dark:text-red-400">
            404 - Page Not Found
          </h1>
        </BlurFade>
        <BlurFadeText
          className="max-w-[600px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400"
          delay={0.04 * 2}
          text="The page you are looking for does not exist. It might have been moved or deleted."
        />
      </div>
      <BlurFade
        delay={0.04 * 3}
        className="flex gap-4"
      >
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/blog">Read Blog</Link>
        </Button>
      </BlurFade>
    </section>
  );
}
