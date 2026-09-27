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
          lines={DATA.hero}
          avatarUrl={DATA.avatarUrl}
          initials={DATA.initials}
          hireUrl={DATA.contact.social.email.url}
          workUrl="/projects"
        />

        <ProjectsSection
          heading="Don't believe me? Check out my projects!"
          projects={toViscoseProjects(
            DATA.projects.filter((project) => (project as any).featured),
          )}
        />

        <WorkStack
          kicker="That's not enough?"
          heading="You want to know who I've actually worked with?"
          srLabel="Work Experience"
          intro="Fair enough. Here are the people and teams who have trusted me to build things for them."
          works={DATA.work.filter((work) => (work as any).featured) as any}
        />

        <AboutReveal
          kicker="Here's a little more about me!"
          heading="I'm a tinkerer at heart."
          paragraphs={DATA.summary}
          resumeUrl={DATA.contact.social.Resume.url}
        />

        <BlogSection
          kicker="That's not all:"
          heading="I have thoughts."
          srLabel="Recent Writing"
          intro="Like every slightly obsessive nerd with a computer, I have opinions about the things I build. Sometimes I write them down."
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
        </BlogSection>

        <SkillPills
          title="A few of the tools I get my hands dirty with"
          srLabel="Skills"
          skills={DATA.skills}
        />

        <ContactSection emailUrl={DATA.contact.social.email.url} />
      </FullPageScroll>
    </main>
  );
}
