import { DATA } from "@/data/resume";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = DATA.url.replace(/\/$/, "");

  const work = DATA.work
    .map(
      (job) =>
        `- **${job.title}, ${job.company}** (${job.start} – ${job.end}): ${job.description} ${job.href}`,
    )
    .join("\n");

  const projects = DATA.projects
    .map(
      (project) =>
        `- **${project.title}** (${project.technologies.join(", ")}): ${project.description} ${project.href}`,
    )
    .join("\n");

  const education = DATA.education
    .map((edu) => `- ${edu.degree}, ${edu.school} (${edu.href})`)
    .join("\n");

  const socials = Object.values(DATA.contact.social)
    .filter((social) => social.url.startsWith("http"))
    .map((social) => `- ${social.name}: ${social.url}`)
    .join("\n");

  const text = `# ${DATA.name}

> ${DATA.description}

${DATA.summary}

Based in ${DATA.location}. Contact: ${DATA.contact.email}

## Skills

${DATA.skills.join(", ")}

## Work Experience

${work}

## Projects

${projects}

## Education

${education}

## Links

- Website: ${baseUrl}
- Blog: ${baseUrl}/blog
- Projects: ${baseUrl}/projects
- Work history: ${baseUrl}/work
${socials}
`;

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate",
    },
  });
}
