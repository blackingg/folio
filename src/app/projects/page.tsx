import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Projects | " + DATA.name,
  description:
    "A showcase of all my projects, from web apps to 3D experiences.",
};

const BLUR_FADE_DELAY = 0.04;
const ITEMS_PER_PAGE = 6;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const totalProjects = DATA.projects.length;
  const totalPages = Math.ceil(totalProjects / ITEMS_PER_PAGE);

  const paginatedProjects = DATA.projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                  Full Portfolio
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  All My Projects
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px] mx-auto">
                  A comprehensive list of everything I&apos;ve built, updated
                  regularly.
                </p>
              </div>
            </div>
          </BlurFade>
        </section>

        <section id="projects-grid">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mx-auto">
            {paginatedProjects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 2 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </section>

        {totalPages > 1 && (
          <section id="pagination">
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <div className="flex justify-center items-center gap-4 mt-12">
                <Link
                  href={`/projects?page=${Math.max(1, currentPage - 1)}`}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Link
                        key={p}
                        href={`/projects?page=${p}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${
                          currentPage === p
                            ? "bg-foreground text-background"
                            : "hover:bg-accent"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>

                <Link
                  href={`/projects?page=${Math.min(
                    totalPages,
                    currentPage + 1
                  )}`}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent"
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </BlurFade>
          </section>
        )}
      </div>
    </main>
  );
}
