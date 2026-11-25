// PitchCraft orchestrator-worker, as an isometric line figure in the style of
// Linear's "Fig 0.x" illustrations: hairline outlines on paper, no shading.
//
//   brand card -> ROOT cube -> three worker cubes -> write-artifact cube -> deck
//
// The deck is a run of stepped slides. Connectors lie on the floor plane and
// carry a slow dash that runs in the direction of the work.
//
// Build: node scripts/diagrams/pitchcraft.mjs
// Writes: src/assets/images/pitchcraft/orchestrator.svg

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../src/assets/images/pitchcraft/orchestrator.svg");

const WIDTH = 960;
const HEIGHT = 460;

// World plan, x along the flow, y across it, z up. Units are arbitrary.
const CUBE = 40;
const LONG = 80;
const card = { x: -404, y: -24, w: 48, d: 48, r: 3 };
const root = { x: -300, y: -20, w: LONG, d: CUBE, r: 4 };
const workers = [-108, -20, 68].map((y) => ({ x: -156, y, w: LONG, d: CUBE, r: 4 }));
const writer = { x: -10, y: -20, w: LONG, d: CUBE, r: 4 };
const ROOT_H = 46;
const WORKER_H = 30;
const WRITER_H = 46;
const CARD_H = 3;

// The deck: slides standing on their long edge, tallest first.
const SLIDES = Array.from({ length: 7 }, (_, i) => ({
  plan: { x: 108 + i * 9, y: -26, w: 2.4, d: 52, r: 1 },
  h: 56 - i * 7,
}));

const extremes = [
  ...k.boxCorners(card, 0, CARD_H),
  ...k.boxCorners(root, 0, ROOT_H),
  ...workers.flatMap((w) => k.boxCorners(w, 0, WORKER_H)),
  ...k.boxCorners(writer, 0, WRITER_H),
  ...SLIDES.flatMap((s) => k.boxCorners(s.plan, 0, s.h)),
];
const P = k.fitProjection(extremes, WIDTH, HEIGHT, { pad: 14, azimuth: 45 });
const at = (p) => k.iso(p, P);
const mid = (plan) => [plan.x + plan.w / 2, plan.y + plan.d / 2];

// ---------------------------------------------------------------- floor lines
// Each connector is a polyline on the floor (z = 0) from one part's east face
// to the next part's west face, with square turns like a circuit trace.
function trace(points) {
  return points.map((p) => at([p[0], p[1], 0]));
}
const east = (plan) => plan.x + plan.w;
const flows = [];
const cy = (plan) => plan.y + plan.d / 2;
flows.push(
  trace([
    [east(card), cy(card)],
    [root.x, cy(root)],
  ]),
);
for (const w of workers) {
  const bend = (east(root) + w.x) / 2;
  flows.push(
    trace([
      [east(root), cy(w) === cy(root) ? cy(root) : cy(root) + Math.sign(cy(w) - cy(root)) * 10],
      [bend, cy(w) === cy(root) ? cy(root) : cy(root) + Math.sign(cy(w) - cy(root)) * 10],
      [bend, cy(w)],
      [w.x, cy(w)],
    ]),
  );
  const bend2 = (east(w) + writer.x) / 2;
  const land = cy(w) === cy(writer) ? cy(writer) : cy(writer) + Math.sign(cy(w) - cy(writer)) * 10;
  flows.push(
    trace([
      [east(w), cy(w)],
      [bend2, cy(w)],
      [bend2, land],
      [writer.x, land],
    ]),
  );
}
flows.push(
  trace([
    [east(writer), cy(writer)],
    [SLIDES[0].plan.x, cy(writer)],
  ]),
);

const path = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}`;
const floorLines = flows
  .map((pts) => {
    const d = path(pts);
    const dots = [pts[0], pts[pts.length - 1]]
      .map((p) => `<circle class="dot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.6"/>`)
      .join("");
    return `<path class="rail" d="${d}"/><path class="flow" d="${d}"/>${dots}`;
  })
  .join("");

// ---------------------------------------------------------------- solids
const solid = (plan, h, steps = 6, bevel = 1.2) => {
  const s = k.slabOf(plan, 0, h, P, steps, bevel);
  return `<g class="slab"><path class="fill" d="${s.fill}"/>${s.bevel ? `<path class="bevel" d="${s.bevel}"/>` : ""}<path class="crease" d="${s.crease}"/><path class="edge" d="${s.outline}"/></g>`;
};

// A perforation grid near the back corner of a cube's top, the "agent" mark.
const grille = (plan, h) => {
  const pts = k.dotGrid(plan.x + 7, plan.y + 7, 5, 5, 2.2, h, P);
  return pts
    .map(([x, y]) => `<circle class="grille" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.55"/>`)
    .join("");
};

const label = (plan, h, text) => {
  const [x] = mid(plan);
  return `<g transform="${k.sideMatrix([x, plan.y + plan.d], h / 2 - 2, P, "left")}"><text class="label" text-anchor="middle">${text}</text></g>`;
};

const cube = (plan, h, text) => solid(plan, h) + grille(plan, h) + label(plan, h, text);

// The brand card: a thin plate with three rule lines, like a name card.
function brandCard() {
  let out = solid(card, CARD_H, 4, 0.8);
  for (const [i, len] of [
    [0, 28],
    [1, 20],
    [2, 24],
  ]) {
    const y = card.y + 15 + i * 8;
    out += `<path class="rule" d="${k.lineOnTop([card.x + 10, y], [card.x + 10 + len, y], CARD_H, P)}"/>`;
  }
  return out;
}

// Paint back to front.
const parts = [
  { at: [...mid(card), 0], svg: brandCard() },
  { at: [...mid(root), 0], svg: cube(root, ROOT_H, "root") },
  ...workers.map((w, i) => ({
    at: [...mid(w), 0],
    svg: cube(w, WORKER_H, ["brand-researcher", "social-listening", "competitor-analysis"][i]),
  })),
  { at: [...mid(writer), 0], svg: cube(writer, WRITER_H, "write-artifact") },
  ...SLIDES.map((s) => ({ at: [...mid(s.plan), 0], svg: solid(s.plan, s.h, 3, 0.7) })),
].sort((a, b) => k.depthOf(a.at, P) - k.depthOf(b.at, P));

const STYLE = `
  .pc { --ink:#1b1b1d; --soft:#8f8f94; --faint:#c9c9cc; --paper:#ffffff; }
  .pc .bg { fill: var(--paper); }
  .pc .fill { fill: var(--paper); }
  .pc .edge { fill: none; stroke: var(--ink); stroke-width: 1; stroke-linejoin: round; }
  .pc .crease { fill: none; stroke: var(--ink); stroke-width: 0.8; stroke-linejoin: round; }
  .pc .bevel { fill: none; stroke: var(--faint); stroke-width: 0.8; stroke-linecap: round; }
  .pc .rule { fill: none; stroke: var(--faint); stroke-width: 1.2; stroke-linecap: round; }
  .pc .grille { fill: var(--soft); }
  .pc .label { font: 500 6.6px/1 "Host Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; fill: var(--soft); letter-spacing: .02em; }
  .pc .rail { fill: none; stroke: var(--faint); stroke-width: 1; stroke-linejoin: round; }
  .pc .flow { fill: none; stroke: var(--ink); stroke-width: 1; stroke-linejoin: round; stroke-dasharray: 3 13; animation: pc-flow 1.8s linear infinite; }
  .pc .dot { fill: var(--paper); stroke: var(--ink); stroke-width: 1; }
  @keyframes pc-flow { to { stroke-dashoffset: -32; } }
  @media (prefers-reduced-motion: reduce) { .pc .flow { animation: none; stroke-dasharray: none; stroke: var(--soft); } }
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="pc" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Orchestrator-worker flow: a brand name goes to the root agent, which sends a task to brand-researcher, social-listening and competitor-analysis, whose findings converge on write-artifact, which outputs the deck">
<style>${STYLE}</style>
<rect class="bg" width="${WIDTH}" height="${HEIGHT}"/>
<g>${floorLines}</g>
<g>${parts.map((p) => p.svg).join("")}</g>
</svg>
`;

writeFileSync(OUT, svg);
console.log("wrote", OUT, `${(svg.length / 1024).toFixed(1)} KB`);
