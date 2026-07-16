import { ContactIllustration } from "@/components/contact-illustration";
import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { ResumeCard } from "@/components/resume-card";
import { ScrollFadeSection } from "@/components/scroll-fade-section";
import { WorkStack } from "@/components/work-stack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillPills } from "@/components/skill-pills";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import { ChevronRight } from "lucide-react";
import { getBlogPosts } from "@/data/blog";
import { BlogCard } from "@/components/blog-card";
import { BlogCardsReveal } from "@/components/blog-cards-reveal";

const BLUR_FADE_DELAY = 0.04;

export default async function Page() {
  const posts = await getBlogPosts();
  const latestPosts = posts.slice(0, 3);
  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      {/* Page 1: hero + about fill the viewport so the next page stays below the fold. */}
      <div className="flex min-h-[calc(100svh-3rem)] flex-col justify-center gap-y-10 sm:min-h-[calc(100svh-6rem)]">
        <section id="hero">
          <ScrollFadeSection>
            <div className="mx-auto w-full max-w-3xl space-y-8">
              <div className="flex flex-col-reverse sm:flex-row gap-6 items-center sm:items-start justify-between">
                <div className="flex-col flex flex-1 space-y-2 text-center sm:text-left">
                  <h1 className="sr-only">
                    {DATA.name} - Frontend Engineer Portfolio
                  </h1>
                  <BlurFadeText
                    delay={BLUR_FADE_DELAY}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                    yOffset={8}
                    text={`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}
                  />
                  <BlurFadeText
                    className="max-w-[700px] text-base sm:text-lg md:text-xl text-left leading-relaxed"
                    delay={BLUR_FADE_DELAY}
                    text={DATA.description}
                  />
                </div>
                <BlurFade delay={BLUR_FADE_DELAY}>
                  <Avatar className="size-56 md:size-32 border-2 shadow-sm">
                    <AvatarImage
                      alt={DATA.name}
                      src={DATA.avatarUrl}
                    />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                </BlurFade>
              </div>
            </div>
          </ScrollFadeSection>
        </section>
        <section id="about">
          <ScrollFadeSection>
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <h2 className="text-xl font-bold">About</h2>
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <Markdown className="prose max-w-full text-pretty font-sans text-base text-foreground/80 dark:prose-invert leading-relaxed">
                {DATA.summary}
              </Markdown>
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 4.5}>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={DATA.contact.social.Resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Download Resume
                </Link>
              </div>
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 4.8}>
              <Link
                href="/3d"
                className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                <span className="text-sm sm:text-base font-medium tracking-tight">
                  Explore 3D Experience <span className="text-xl">🚧</span>
                </span>
                <ChevronRight className="h-4 w-4 text-foreground/60 transition-all group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            </BlurFade>
          </ScrollFadeSection>
        </section>
      </div>
      {/* Page 2: skills pin until the pill cascade completes. */}
      <section id="skills">
        <SkillPills
          title="Skills"
          skills={DATA.skills}
        />
      </section>
      {/* Page 3: Work Experience */}
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <WorkStack
            title="Work Experience"
            works={DATA.work.filter((work) => (work as any).featured) as any}
          />
        </div>
      </section>

      {/* <section id="education">
        <ScrollFadeSection className="flex min-h-[100svh] flex-col justify-center gap-y-3">
          <BlurFade inView>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              inView
              delay={id * 0.1}
              className="w-full"
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={
                  education.start
                    ? `${education.start} - ${education.end}`
                    : undefined
                }
              />
            </BlurFade>
          ))}
        </ScrollFadeSection>
      </section> */}

      {/* Page 4: Projects */}
      <section id="projects">
        <ScrollFadeSection
          enterOffset={["start end", "start start"]}
          exitOffset={["end end", "end start"]}
          className="space-y-12 w-full py-12"
        >
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-4 py-1.5 text-sm font-medium">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px] mx-auto">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <HorizontalScroller
            footer={
              <div className="flex justify-center">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-foreground"
                >
                  View All Projects
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            }
          >
            {DATA.projects
              .filter((project) => (project as any).featured)
              .map((project) => (
                <ProjectCard
                  key={project.title}
                  href={project.href}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              ))}
          </HorizontalScroller>
        </ScrollFadeSection>
      </section>
      <section id="blog">
        <ScrollFadeSection className="flex min-h-[100svh] w-full flex-col justify-center gap-y-12 py-12">
          <BlurFade inView>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Recent Writing
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px] mx-auto">
                  I share my thoughts on software development, life, and the
                  things I&apos;m learning along the way.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlogCardsReveal
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto px-4 sm:px-0"
            itemClassName="sm:last:odd:col-span-2 lg:last:odd:col-span-1"
          >
            {latestPosts.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                publishedAt={post.publishedAt}
                summary={post.summary}
                image={post.image}
                slug={post.slug}
                readingTime={post.readingTime}
              />
            ))}
          </BlogCardsReveal>
          <BlurFade inView>
            <div className="flex justify-center mt-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View All Posts
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </BlurFade>
        </ScrollFadeSection>
      </section>
      {/* <section id="hackathons">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Other Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  I like building things
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  These are some of the other projects I&apos;ve worked on.
                  Contract work, personal projects, and hackathons.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {DATA.hackathons.map((project, id) => (
                <BlurFade
                  key={project.title + project.dates}
                  delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                >
                  <HackathonCard
                    title={project.title}
                    description={project.description}
                    location={project.location}
                    dates={project.dates}
                    image={project.image}
                    links={project.links}
                  />
                </BlurFade>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section> */}
      <section id="contact">
        <ScrollFadeSection className="grid min-h-[calc(100svh-5rem)] sm:min-h-[calc(100svh-8rem)] items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade inView>
            <div className="space-y-3">
              <ContactIllustration className="mx-auto size-40 sm:size-48 lg:size-64" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a mail{" "}
                <Link
                  href={DATA.contact.social.email.url}
                  className="text-neon hover:underline"
                >
                  here
                </Link>{" "}
                and I&apos;ll respond whenever I can.
              </p>
            </div>
          </BlurFade>
        </ScrollFadeSection>
      </section>
    </main>
  );
}
