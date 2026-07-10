import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const writings = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/writings" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      status: z.enum(["published", "draft"]),
      thumbnail: image(),
      thumbnailAlt: z.string(),
    }),
});

const works = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    date: z.coerce.date(),
    url: z.string().optional(),
  }),
});

const links = defineCollection({
  loader: file("./src/content/links.json"),
  schema: z.object({
    title: z.string(),
    link: z.string(),
  }),
});

export const collections = { writings, works, links };
