import { NextResponse, type NextRequest } from "next/server";

/**
 * /projects used to be paginated. It now renders every project at once, so
 * `?page=N` addresses nothing — but those URLs are indexed, and left alone
 * they'd serve a byte-identical duplicate of /projects under a dozen
 * addresses. Send them to the canonical one instead.
 *
 * This lives in middleware rather than in the page because reading
 * `searchParams` inside a route opts that route out of static rendering, and
 * /projects is worth keeping static for the sake of one dead query param.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.search = "";
  // Permanent: the paged URLs are not coming back, and 308 is what tells a
  // crawler to fold their ranking into /projects rather than just following
  // along. The redirect target has no `page` param, so it can't re-match the
  // config below and loop.
  return NextResponse.redirect(url, 308);
}

// Narrow on purpose: this runs only for /projects, and only when a `page`
// param is actually present. Every other request skips middleware entirely.
export const config = {
  matcher: [
    {
      source: "/projects",
      has: [{ type: "query", key: "page" }],
    },
  ],
};
