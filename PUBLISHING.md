# Publishing workflow

The site (whoisblxck.xyz) is the canonical home for all blog content. Posts live
as MDX files in `content/`, and Medium receives copies via its Import tool,
which automatically sets the Medium copy's canonical URL to point back here.

## Writing a new post

1. Create `content/<slug>.mdx`. The filename is the URL: `/blog/<slug>`.

   ```markdown
   ---
   title: "Post Title"
   publishedAt: "2026-07-15T12:00:00.000Z"
   summary: "One or two sentences used as the meta description and card preview."
   image: "/blog/<slug>/cover.png"        # optional, put files in public/blog/<slug>/
   keywords:                               # optional
     - "frontend"
   ---

   Post body in markdown...
   ```

2. Push to `main` and wait for the deploy. Confirm the post is live at
   `https://www.whoisblxck.xyz/blog/<slug>`.

3. Cross-post to Medium: go to <https://medium.com/p/import>, paste the live
   post URL, review, and publish. Medium sets the canonical to the site
   automatically — no extra step needed.

4. Copy the new Medium story URL into the post's frontmatter and push:

   ```yaml
   mediumLink: "https://medium.com/@odetundemubarak/<medium-slug>"
   ```

   This renders the "Check this post out on Medium" button on the post page.

5. Optional: if you significantly edit a post later, add
   `updatedAt: "<ISO date>"` to the frontmatter — it feeds `dateModified` in
   the structured data and the sitemap's `lastmod`.

## Re-homing the original 8 Medium posts (one-time)

These were originally published on Medium, so Medium considers itself canonical
for them. To flip that, each post is deleted on Medium and re-imported from the
site. **Order matters:**

> **Never delete a Medium story before its MDX twin is verified live in
> production.** The Import tool fetches the live page — if the site copy isn't
> up, there is nothing to import.

Per post:

1. Verify `https://www.whoisblxck.xyz/blog/<slug>` renders correctly in
   production (text, images, code blocks).
2. On Medium, open the story → ⋯ menu → Delete story.
3. Go to <https://medium.com/p/import> and import the site URL.
4. Review the imported draft (embeds/formatting), then publish.
5. Verify the new Medium story's page source contains
   `<link rel="canonical" href="https://www.whoisblxck.xyz/blog/<slug>">`.
6. Update `mediumLink` in the post's frontmatter to the new Medium URL; push.

Notes:
- The old `medium.com` URL 404s after deletion and claps/comments are lost —
  this was a deliberate trade-off to make the site canonical.
- After re-homing, run the changed URLs through Google Search Console
  (URL Inspection → Request indexing) to speed up re-crawling.

## Backfill script (already run)

`npm run backfill:medium` converts a Medium account-data export
(`.medium-export/posts/*.html`, from Settings → Security → Download your
information) into `content/*.mdx` with images downloaded to
`public/blog/<slug>/`. It preserves Medium slugs so URLs stay stable, and it is
idempotent (re-running overwrites the MDX and skips already-downloaded images).
Kept for reference; normally new posts are just written by hand as MDX.
