import { Icons } from "@/components/icons";
import { ChevronLeft } from "lucide-react";
import { getPost, getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata | undefined> {
  const { slug } = params;
  let post = await getPost(slug);

  if (!post) {
    return;
  }

  const baseUrl = DATA.url.replace(/\/$/, "");
  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
    keywords,
  } = post.metadata;

  let ogImage = image
    ? image.startsWith("http")
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}/me.png`;

  return {
    title,
    description,
    keywords: keywords || [],
    authors: [{ name: DATA.name }],
    alternates: {
      canonical: post.metadata.mediumLink || `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
      authors: [DATA.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@whoisBlxck",
      site: "@whoisBlxck",
    },
  };
}

export default async function Blog({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const { slug } = params;
  let post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <section id="blog">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? post.metadata.image.startsWith("http")
                ? post.metadata.image
                : `${DATA.url.replace(/\/$/, "")}${post.metadata.image}`
              : `${DATA.url.replace(/\/$/, "")}/me.png`,
            url: `${DATA.url.replace(/\/$/, "")}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: DATA.name,
              url: DATA.url,
            },
            publisher: {
              "@type": "Organization",
              name: DATA.name,
              logo: {
                "@type": "ImageObject",
                url: `${DATA.url.replace(/\/$/, "")}/me.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${DATA.url.replace(/\/$/, "")}/blog/${post.slug}`,
            },
          }),
        }}
      />
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>
      </div>
      <h1 className="title font-medium text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <Suspense fallback={<p className="h-5" />}>
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <p>{formatDate(post.metadata.publishedAt, true)}</p>
            {post.metadata.readingTime && (
              <>
                <span>•</span>
                <p>{post.metadata.readingTime}</p>
              </>
            )}
          </div>
        </Suspense>
      </div>
      <article
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.source }}
      ></article>
      {post.metadata.mediumLink && (
        <div className="mt-12 pt-8 border-t">
          <Link
            href={post.metadata.mediumLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <Icons.medium className="size-4" />
            Check this post out on Medium
          </Link>
        </div>
      )}
    </section>
  );
}
