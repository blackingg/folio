import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WorkExperienceScroller } from "@/components/work-experience-scroller";

export const metadata = {
  title: "Work Experience | " + DATA.name,
  description:
    "A detailed timeline of my professional career as a software engineer.",
};

const BLUR_FADE_DELAY = 0.04;

export default function WorkPage() {
  return (
    <main className="flex flex-col min-h-screen py-12 px-6 md:px-0">
      <div className="mx-auto w-full max-w-3xl space-y-12">
        <section id="header">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
              >
                <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                Back to overview
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-4 py-1.5 text-sm font-medium">
                  Career Path
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Work Experience
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px] mx-auto">
                  A comprehensive look at my professional journey, the teams
                  I&apos;ve worked with, and the impact I&apos;ve made along
                  the way.
                </p>
              </div>
            </div>
          </BlurFade>
        </section>

        <section id="work-list">
          <WorkExperienceScroller works={DATA.work as any} />
        </section>

        <section id="contact">
          <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
            <BlurFade delay={BLUR_FADE_DELAY * 16}>
              <div className="space-y-3">
                <div className="inline-block rounded-lg bg-foreground text-background px-4 py-1.5 text-sm font-medium">
                  Contact
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Get in Touch
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Want to chat? Just shoot me a mail{" "}
                  <Link
                    href={DATA.contact.social.email.url}
                    className="text-blue-500 hover:underline"
                  >
                    here
                  </Link>{" "}
                  and I&apos;ll respond whenever I can.
                </p>
              </div>
            </BlurFade>
          </div>
        </section>
      </div>
    </main>
  );
}
