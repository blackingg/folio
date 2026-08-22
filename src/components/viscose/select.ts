import type { ViscoseProject } from "./viscose-carousel";

type SourceProject = {
  title: string;
  href?: string;
  dates: string;
  description: string;
  technologies: readonly string[];
  image?: string;
  links?: readonly { type: string; href: string }[];
};

/**
 * DATA.projects carries a rendered icon on every link, which cannot cross the
 * server/client boundary. Everything the ring needs is plain data, so strip to
 * that on the way through.
 *
 * Projects with no screenshot are dropped rather than shown blank: a card in
 * the ring is its artwork, and an empty cell in the atlas reads as a bug.
 */
export function toViscoseProjects(
  projects: readonly SourceProject[],
): ViscoseProject[] {
  return projects
    .filter((p) => Boolean(p.image))
    .map((p) => ({
      title: p.title,
      href: p.href,
      dates: p.dates,
      description: p.description,
      technologies: p.technologies,
      image: p.image,
      links: p.links?.map(({ type, href }) => ({ type, href })),
    }));
}
