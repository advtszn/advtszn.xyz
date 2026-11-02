import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { absoluteUrl } from "~/lib/seo";

type Entry = { path: string; lastmod?: Date };

const toUrlEntry = (site: URL | undefined, { path, lastmod }: Entry) => {
  const loc = absoluteUrl(path, site);
  const date = lastmod ? `<lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>` : "";

  return `  <url><loc>${loc}</loc>${date}</url>`;
};

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response("Site URL is not configured", { status: 500 });
  }

  const [writings, works] = await Promise.all([getCollection("writings"), getCollection("works")]);

  // Newest content date doubles as the lastmod for the pages that list it.
  const newest = (dates: Date[]) =>
    dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;

  const entries: Entry[] = [
    { path: "/", lastmod: newest([...writings, ...works].map((e) => e.data.date)) },
    { path: "/works/", lastmod: newest(works.map((w) => w.data.date)) },
    { path: "/writings/", lastmod: newest(writings.map((w) => w.data.date)) },
    { path: "/archive/" },
    ...works.map(({ id, data }) => ({
      path: `/work/${id}/`,
      lastmod: data.date,
    })),
    ...writings.map(({ id, data }) => ({
      path: `/writings/${id}/`,
      lastmod: data.date,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => toUrlEntry(site, entry)).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
