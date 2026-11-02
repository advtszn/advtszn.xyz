import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writings = defineCollection({
  loader: glob({
    pattern: ["*.mdx", "!_*.mdx"],
    base: "./src/content/writings",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: ["*.mdx", "!_*.mdx"], base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    role: z.string(),
    tech: z.array(z.string()),
    url: z.string().optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    thumbnail: z.string(),
    timeline: z.string(),
    overview: z.string(),
    contribution: z.string(),
  }),
});

export const collections = { writings, works };
