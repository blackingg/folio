import { AboutReveal } from "@/components/about-reveal";
import { BlogCard } from "@/components/blog-card";
import { BlogSection } from "@/components/blog-section";
import { ContactSection } from "@/components/contact-section";
import { FullPageScroll } from "@/components/full-page-scroll";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { toViscoseProjects } from "@/components/viscose/select";
import { SkillPills } from "@/components/skill-pills";
import { WorkStack } from "@/components/work-stack";
import { DATA } from "@/data/resume";
import { getBlogPosts } from "@/data/blog";

export default async function Page() {
  const posts = await getBlogPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <main>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${DATA.url}/#website`,
                url: DATA.url,
                name: DATA.name,
                publisher: { "@id": `${DATA.url}/#person` },
              },
              {
                "@type": "ProfilePage",
                "@id": `${DATA.url}/#profilepage`,
                url: DATA.url,
                isPartOf: { "@id": `${DATA.url}/#website` },
                mainEntity: { "@id": `${DATA.url}/#person` },
              },
            ],
          }),
        }}
      />
      <FullPageScroll>
        <HeroSection
          name={DATA.name}
          description={DATA.description}
          avatarUrl={DATA.avatarUrl}
          initials={DATA.initials}
        />

        <AboutReveal
          summary={DATA.summary}
          resumeUrl={DATA.contact.social.Resume.url}
        />

        <SkillPills
          title="Skills"
          skills={DATA.skills}
        />

        <ProjectsSection
          projects={toViscoseProjects(
            DATA.projects.filter((project) => (project as any).featured),
          )}
        />

        <WorkStack
          title="Work Experience"
          works={DATA.work.filter((work) => (work as any).featured) as any}
        />

        <BlogSection>
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
        </BlogSection>

        <ContactSection emailUrl={DATA.contact.social.email.url} />
      </FullPageScroll>
    </main>
  );
}
