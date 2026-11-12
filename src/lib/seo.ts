/**
 * Single source of truth for the structured data and absolute URLs the
 * metadata in `Layout.astro` depends on. Everything here is build-time only.
 */

export const SITE = {
  name: "advtszn",
  author: "advait",
  handle: "@advtszn",
  email: "hey@advtszn.xyz",
  jobTitle: "multidisciplinary engineer",
  sameAs: ["https://x.com/advtszn", "https://github.com/advtszn", "https://cal.com/advtszn"],
} as const;

/**
 * Builds the absolute URL for a path. Every route is emitted as a directory
 * (`/works/index.html`), so canonicals, `og:url` and the sitemap all have to
 * agree on the trailing slash or they advertise two URLs per page.
 */
export const absoluteUrl = (path: string, site: URL | undefined): string => {
  const base = site ?? new URL("https://www.advtszn.xyz");
  const clean = path.split(/[?#]/)[0];
  const withLeading = clean.startsWith("/") ? clean : `/${clean}`;

  // Files keep their extension; routes get a trailing slash.
  const normalized =
    withLeading === "/" || /\.[a-z0-9]+$/i.test(withLeading)
      ? withLeading
      : withLeading.replace(/\/*$/, "/");

  return new URL(normalized, base).toString();
};

/** JSON-LD goes inside a <script>, so `<` has to be escaped out of the text. */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");

type Graph = Record<string, unknown>;

export const personSchema = (site: URL | undefined): Graph => ({
  "@type": "Person",
  "@id": `${absoluteUrl("/", site)}#person`,
  name: SITE.author,
  alternateName: SITE.name,
  url: absoluteUrl("/", site),
  email: `mailto:${SITE.email}`,
  jobTitle: SITE.jobTitle,
  sameAs: [...SITE.sameAs],
});

export const websiteSchema = (site: URL | undefined): Graph => ({
  "@type": "WebSite",
  "@id": `${absoluteUrl("/", site)}#website`,
  name: SITE.name,
  url: absoluteUrl("/", site),
  publisher: { "@id": `${absoluteUrl("/", site)}#person` },
  inLanguage: "en",
});

/** Crumbs are [label, path] pairs, root first. */
export const breadcrumbSchema = (crumbs: [string, string][], site: URL | undefined): Graph => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: absoluteUrl(path, site),
  })),
});

export const itemListSchema = (
  items: { name: string; path: string }[],
  site: URL | undefined,
): Graph => ({
  "@type": "ItemList",
  numberOfItems: items.length,
  itemListElement: items.map(({ name, path }, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    url: absoluteUrl(path, site),
  })),
});

/** Wraps the page's nodes in one @graph so each page emits a single script. */
export const graph = (nodes: Graph[]): Graph => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});
