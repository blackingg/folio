import { NextResponse, type NextRequest } from "next/server";

/**
 * /projects used to be paginated. It now renders every project at once, so
 * `?page=N` would serve a duplicate of /projects under a dozen indexed
 * addresses.
 *
 * In middleware rather than in the page because reading `searchParams` inside
 * a route opts it out of static rendering.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.search = "";
  // 308, so a crawler folds the old ranking into /projects. The target has no
  // `page` param, so it cannot re-match the config below and loop.
  return NextResponse.redirect(url, 308);
}

// Only /projects, and only with a `page` param present.
export const config = {
  matcher: [
    {
      source: "/projects",
      has: [{ type: "query", key: "page" }],
    },
  ],
};
