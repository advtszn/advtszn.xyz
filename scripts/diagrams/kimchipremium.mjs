// Kimchi Premium ETL pipeline as an isometric line figure.
// Three trays left to right: ingestion, processing, delivery.
//
// Build: node scripts/diagrams/kimchipremium.mjs
// Writes: src/assets/images/kimchipremium/pipeline-diagram.svg

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { figure, k } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../src/assets/images/kimchipremium/pipeline-diagram.svg");

const T = 3; // tray thickness; everything stands on z = T
const trays = {
  ingestion: { x: -478, y: -128, w: 196, d: 178, r: 6 },
  processing: { x: -262, y: -52, w: 404, d: 104, r: 6 },
  delivery: { x: 190, y: -116, w: 196, d: 220, r: 6 },
};

const L = 56; // box length along the flow
const D = 40;
const H = 32;
const box = (x, y, w = L) => ({ x, y, w, d: D, r: 4 });

const sources = { x: -462, y: -24, w: 46, d: 46, r: 3 };
const cron = box(-372, -112, 52);
const scraper = box(-372, -20);
const webhook = box(-246, -20);
const queue = { x: -150, y: -24, w: 46, d: 48, r: 3 };
const summarize = box(-62, -20);
const translate = box(42, -20, 72);
const telegram = box(206, -96);
const sanity = box(206, 36);
const site = box(310, 36, 60);
const QUEUE_N = 6;

const F = figure({
  width: 960,
  height: 440,
  extremes: Object.values(trays).flatMap((t) => k.boxCorners(t, 0, T + H + 10)),
  pad: 10,
  azimuth: 62,
});
const { cube, stack, flat, trace, painted, doc, slab, midOf } = F;

const Z = T;
const cyOf = (b) => b.y + b.d / 2;
const east = (b) => b.x + b.w;

const traces = [
  [
    [east(sources), cyOf(sources), Z],
    [scraper.x, cyOf(scraper), Z],
  ],
  [
    [cron.x + cron.w / 2, cron.y + cron.d, Z],
    [cron.x + cron.w / 2, scraper.y, Z],
  ],
  [
    [east(scraper), cyOf(scraper), Z],
    [webhook.x, cyOf(webhook), Z],
  ],
  [
    [east(webhook), cyOf(webhook), Z],
    [queue.x, cyOf(webhook), Z],
  ],
  [
    [east(queue), cyOf(webhook), Z],
    [summarize.x, cyOf(summarize), Z],
  ],
  [
    [east(summarize), cyOf(summarize), Z],
    [translate.x, cyOf(translate), Z],
  ],
  [
    [east(translate), cyOf(translate) - 8, Z],
    [166, cyOf(translate) - 8, Z],
    [166, cyOf(telegram), Z],
    [telegram.x, cyOf(telegram), Z],
  ],
  [
    [east(translate), cyOf(translate) + 8, Z],
    [166, cyOf(translate) + 8, Z],
    [166, cyOf(sanity), Z],
    [sanity.x, cyOf(sanity), Z],
  ],
  [
    [east(sanity), cyOf(sanity), Z],
    [site.x, cyOf(site), Z],
  ],
]
  .map(trace)
  .join("");

const zones = Object.entries(trays)
  .map(
    ([name, t]) =>
      slab(t, 0, T, { steps: 8, bevel: 0 }) +
      flat(
        [name === "delivery" ? t.x + 76 : t.x + t.w - 8 - name.length * 4.6, t.y + t.d - 9],
        T,
        name,
      ),
  )
  .join("");

const sourceCount = 5;
const parts = [
  {
    at: [...midOf(sources), Z],
    svg:
      stack(sources, Z, sourceCount) +
      flat([sources.x, sources.y + sources.d + 12], Z, "news sources", "label"),
  },
  { at: [...midOf(cron), Z], svg: cube(cron, Z, 20, "cron", { mark: false }) },
  { at: [...midOf(scraper), Z], svg: cube(scraper, Z, H, "scraper") },
  { at: [...midOf(webhook), Z], svg: cube(webhook, Z, H, "webhook") },
  {
    at: [...midOf(queue), Z],
    svg:
      stack(queue, Z, QUEUE_N) +
      flat([queue.x, queue.y + queue.d + 12], Z, "bullmq queue", "label"),
  },
  { at: [...midOf(summarize), Z], svg: cube(summarize, Z, H, "summarize") },
  { at: [...midOf(translate), Z], svg: cube(translate, Z, H, "translate to kr") },
  { at: [...midOf(telegram), Z], svg: cube(telegram, Z, H - 4, "telegram") },
  { at: [...midOf(sanity), Z], svg: cube(sanity, Z, H - 4, "sanity cms") },
  { at: [...midOf(site), Z], svg: cube(site, Z, H + 8, "astro site") },
];

const svg = doc({
  label:
    "Kimchi Premium ETL pipeline in three stages. Ingestion: a cron job triggers a scraper that pulls headlines from news sources. Processing: a webhook enqueues one BullMQ job per headline, an LLM summarizes it and a second pass translates it to Korean. Delivery: the Korean version goes to Telegram, both languages go to Sanity CMS, and the Astro site reads from Sanity.",
  layers: [zones, traces, painted(parts)],
});

writeFileSync(OUT, svg);
console.log("wrote", OUT, `${(svg.length / 1024).toFixed(1)} KB`);
