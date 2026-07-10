import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";

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

  const writings: CollectionEntry<"writings">[] = await getCollection(
    "writings",
    (entry: CollectionEntry<"writings">) => entry.data.status === "published",
  );

  const writingPaths = writings.map(({ id }) => `/writings/${id}/`);
  const urls = [...staticPaths, ...writingPaths].map((pathname) => toUrlEntry(site, pathname));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
