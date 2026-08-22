import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { toViscoseProjects } from "@/components/viscose/select";
import { DATA } from "@/data/resume";

export const metadata = {
  title: "Projects",
  description: "A showcase of all my projects, from web apps to 3D experiences.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects",
    description:
      "A showcase of all my projects, from web apps to 3D experiences.",
    url: "/projects",
    type: "website",
  },
};

const BLUR_FADE_DELAY = 0.04;

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <ProjectsExplorer projects={toViscoseProjects(DATA.projects)}>
        {/* The index (WebGL fallback). Rendered on the server so ProjectCard can
            keep its per-link icons, and so non-WebGL browsers still get the full
            portfolio. Every project, no pagination — the ring holds all of them. */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              All My Projects
            </h1>
            <p className="max-w-[600px] text-sm text-muted-foreground sm:text-base">
              Everything I&apos;ve built, updated regularly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 2 + id * 0.04}
              >
                <ProjectCard
                  href={project.href}
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
        </div>
      </ProjectsExplorer>
    </main>
  );
}
