import type { APIRoute } from "astro";

import { basehub } from "~/lib/basehub";

const staticPaths = [
  "/",
  "/archive/",
  "/archive/gfx/",
  "/kirrin/",
  "/onlyfans/",
  "/socials/",
  "/works/",
  "/writings/",
];

const toUrlEntry = (site: URL, pathname: string) => {
  const url = new URL(pathname, site);

  return `<url><loc>${url.toString()}</loc></url>`;
};

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response("Site URL is not configured", { status: 500 });
  }

  const {
    writings: { items: writings },
  } = await basehub.query({
    writings: {
      __args: {
        filter: { status: { includes: "published" } },
      },
      items: {
        _slug: true,
      },
    },
  });

  const writingPaths = writings.map(({ _slug }) => `/writings/${_slug}/`);
  const urls = [...staticPaths, ...writingPaths].map((pathname) => toUrlEntry(site, pathname));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
