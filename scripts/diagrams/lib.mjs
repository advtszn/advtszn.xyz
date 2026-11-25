// Shared drawing helpers for the isometric line figures (Linear-style:
// hairline outlines on paper, no shading, animated floor traces).
// See pitchcraft.mjs for the original; kimchipremium.mjs and scaling.mjs use this.

import * as k from "./kit/iso-kit.mjs";

export { k };

const FONT = `"Host Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;

const STYLE = `
  .pc { --ink:#1b1b1d; --soft:#8f8f94; --faint:#c9c9cc; --paper:#ffffff; }
  .pc .bg, .pc .fill { fill: var(--paper); }
  .pc .edge { fill: none; stroke: var(--ink); stroke-width: 1; stroke-linejoin: round; }
  .pc .crease { fill: none; stroke: var(--ink); stroke-width: 0.8; stroke-linejoin: round; }
  .pc .bevel { fill: none; stroke: var(--faint); stroke-width: 0.8; stroke-linecap: round; }
  .pc .band { fill: none; stroke: var(--faint); stroke-width: 0.9; stroke-linecap: round; }
  .pc .rule { fill: none; stroke: var(--faint); stroke-width: 1.2; stroke-linecap: round; }
  .pc .grille { fill: var(--soft); }
  .pc .label { font: 500 6.6px/1 ${FONT}; fill: var(--soft); letter-spacing: .02em; }
  .pc .zone { font: 500 6px/1 ui-monospace, "SF Mono", Menlo, monospace; fill: var(--soft); letter-spacing: .12em; text-transform: uppercase; }
  .pc .rail { fill: none; stroke: var(--faint); stroke-width: 1; stroke-linejoin: round; }
  .pc .flow { fill: none; stroke: var(--ink); stroke-width: 1; stroke-linejoin: round; stroke-dasharray: 3 13; animation: pc-flow 1.8s linear infinite; }
  .pc .dot { fill: var(--paper); stroke: var(--ink); stroke-width: 1; }
  @keyframes pc-flow { to { stroke-dashoffset: -32; } }
  @media (prefers-reduced-motion: reduce) { .pc .flow { animation: none; stroke-dasharray: none; stroke: var(--soft); } }
`;

const f1 = (n) => n.toFixed(1);

export function figure({ width, height, extremes, pad = 14, azimuth = 45 }) {
  const P = k.fitProjection(extremes, width, height, { pad, azimuth });
  const at = (p) => k.iso(p, P);
  const midOf = (plan) => [plan.x + plan.w / 2, plan.y + plan.d / 2];

  // A rounded box standing at height z.
  const slab = (plan, z, h, { steps = 6, bevel = 1.2 } = {}) => {
    const s = k.slabOf(plan, z, h, P, steps, bevel);
    return `<g><path class="fill" d="${s.fill}"/>${s.bevel ? `<path class="bevel" d="${s.bevel}"/>` : ""}<path class="crease" d="${s.crease}"/><path class="edge" d="${s.outline}"/></g>`;
  };

  // Text on the front-left (+y) face, reading along x.
  const label = (plan, z, h, text) => {
    const [x] = midOf(plan);
    return `<g transform="${k.sideMatrix([x, plan.y + plan.d], z + h / 2 - 2, P, "left")}"><text class="label" text-anchor="middle">${text}</text></g>`;
  };

  // Text lying flat on a horizontal surface, reading along x.
  const flat = ([x, y], z, text, cls = "zone") =>
    `<g transform="${k.topMatrix([x, y], z, P, "x")}"><text class="${cls}">${text}</text></g>`;

  // A 5×5 perforation grid near the back corner of a top face.
  const grille = (plan, top) =>
    k
      .dotGrid(plan.x + 7, plan.y + 7, 5, 5, 2.2, top, P)
      .map(([x, y]) => `<circle class="grille" cx="${f1(x)}" cy="${f1(y)}" r="0.55"/>`)
      .join("");

  const cube = (plan, z, h, text, { mark = true } = {}) =>
    slab(plan, z, h) + (mark ? grille(plan, z + h) : "") + (text ? label(plan, z, h, text) : "");

  // A stack of thin plates: queues, piles of sources.
  const stack = (plan, z, count, thick = 2.6, gap = 4.4) =>
    Array.from({ length: count }, (_, i) =>
      slab(plan, z + i * (thick + gap), thick, { steps: 4, bevel: 0.8 }),
    ).join("");

  // A thin card with rule lines, a document.
  const card = (plan, z, h = 3) => {
    let out = slab(plan, z, h, { steps: 4, bevel: 0.8 });
    const lines = [
      [0, 0.58],
      [1, 0.42],
      [2, 0.5],
    ];
    for (const [i, share] of lines) {
      const y = plan.y + plan.d * 0.32 + i * plan.d * 0.17;
      out += `<path class="rule" d="${k.lineOnTop([plan.x + 9, y], [plan.x + 9 + (plan.w - 18) * share * 1.6, y], z + h, P)}"/>`;
    }
    return out;
  };

  // A database drum: a cylinder with two band lines near the top.
  const drum = (cx, cy, r, z, h) => {
    const s = k.cylinder(cx, cy, r, z, h, P, 64, 0.8);
    const bands = [h - 9, h - 18]
      .map((dz) => `<path class="band" d="${k.sideArc(cx, cy, r, z + dz, P, 48)}"/>`)
      .join("");
    return `<g><path class="fill" d="${s.fill}"/>${s.bevel ? `<path class="bevel" d="${s.bevel}"/>` : ""}<path class="crease" d="${s.crease}"/>${bands}<path class="edge" d="${s.outline}"/></g>`;
  };

  // A trace through 3D points, with a moving dash and end dots.
  const trace = (points) => {
    const pts = points.map((p) => at(p.length === 3 ? p : [p[0], p[1], 0]));
    const d = `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L")}`;
    const dots = [pts[0], pts[pts.length - 1]]
      .map((p) => `<circle class="dot" cx="${f1(p[0])}" cy="${f1(p[1])}" r="1.6"/>`)
      .join("");
    return `<path class="rail" d="${d}"/><path class="flow" d="${d}"/>${dots}`;
  };

  // Back-to-front order for parts that stand on the floor.
  const painted = (items) =>
    items
      .sort((a, b) => k.depthOf(a.at, P) - k.depthOf(b.at, P))
      .map((i) => i.svg)
      .join("");

  const doc = ({ label: aria, layers }) =>
    `<svg xmlns="http://www.w3.org/2000/svg" class="pc" viewBox="0 0 ${width} ${height}" role="img" aria-label="${aria}">
<style>${STYLE}</style>
<rect class="bg" width="${width}" height="${height}"/>
${layers.map((l) => `<g>${l}</g>`).join("\n")}
</svg>
`;

  return { P, at, midOf, slab, label, flat, grille, cube, stack, card, drum, trace, painted, doc };
}
