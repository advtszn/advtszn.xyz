// Request path for "scaling an api to 1000 concurrent users", as an
// isometric line figure: users -> nginx -> two PM2 workers on one 2-core EC2
// box -> MongoDB Atlas and Redis.
//
// Build: node scripts/diagrams/scaling.mjs
// Writes: src/content/writings/images/scaling-architecture.svg

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { figure, k } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../src/content/writings/images/scaling-architecture.svg");

const EC2_H = 6;
const PM2_H = 4;
const Z1 = EC2_H; // top of the EC2 tray
const Z2 = EC2_H + PM2_H; // top of the PM2 tray
const H = 32;

const users = { x: -262, y: -24, w: 48, d: 48, r: 3 };
const ec2 = { x: -180, y: -112, w: 252, d: 212, r: 8 };
const nginx = { x: -160, y: -20, w: 56, d: 40, r: 4 };
const pm2 = { x: -72, y: -96, w: 128, d: 180, r: 6 };
const w1 = { x: -56, y: -78, w: 92, d: 40, r: 4 };
const w2 = { x: -56, y: 22, w: 92, d: 40, r: 4 };
const mongo = { c: [146, -62], r: 20, h: 40 };
const redis = { c: [146, 58], r: 20, h: 30 };

const F = figure({
  width: 960,
  height: 460,
  extremes: [
    ...k.boxCorners(users, 0, 3),
    ...k.boxCorners(ec2, 0, Z2 + H + 6),
    ...k.boxCorners({ x: 120, y: -84, w: 110, d: 170, r: 0 }, 0, 42),
  ],
  pad: 12,
  azimuth: 58,
});
const { cube, card, drum, slab, flat, trace, painted, doc, midOf } = F;

const cy = (b) => b.y + b.d / 2;
const east = (b) => b.x + b.w;

const traces = [
  // users into the box
  [
    [east(users), 0, 0],
    [ec2.x, 0, 0],
    [ec2.x, 0, Z1],
    [nginx.x, 0, Z1],
  ],
  // nginx proxies upstream to each worker
  ...[w1, w2].map((w) => {
    const lane = cy(w) < 0 ? -8 : 8;
    return [
      [east(nginx), lane, Z1],
      [-88, lane, Z1],
      [-88, cy(w), Z1],
      [pm2.x, cy(w), Z1],
      [pm2.x, cy(w), Z2],
      [w.x, cy(w), Z2],
    ];
  }),
  // the cluster reaches out to the data stores
  ...[
    [-22, mongo],
    [22, redis],
  ].map(([lane, store]) => [
    [east(pm2), lane, Z2],
    [east(pm2), lane, Z1],
    [east(ec2), lane, Z1],
    [east(ec2), lane, 0],
    [104, lane, 0],
    [104, store.c[1], 0],
    [store.c[0] - store.r, store.c[1], 0],
  ]),
]
  .map(trace)
  .join("");

const base =
  slab(ec2, 0, EC2_H, { steps: 8, bevel: 0 }) +
  flat([ec2.x + 10, ec2.y + ec2.d - 10], Z1, "ec2 · 2 vcpu") +
  slab(pm2, Z1, PM2_H, { steps: 8, bevel: 0 }) +
  flat([pm2.x + 10, pm2.y + pm2.d - 9], Z2, "pm2 cluster");

const parts = [
  {
    at: [...midOf(users), 0],
    svg: card(users, 0) + flat([users.x, users.y + users.d + 12], 0, "1000 users · k6", "label"),
  },
  { at: [...midOf(nginx), Z1], svg: cube(nginx, Z1, H, "nginx") },
  { at: [...midOf(w1), Z2], svg: cube(w1, Z2, H, "api worker · core 1") },
  { at: [...midOf(w2), Z2], svg: cube(w2, Z2, H, "api worker · core 2") },
  ...[
    [mongo, "mongodb atlas"],
    [redis, "redis"],
  ].map(([s, name]) => ({
    at: [...s.c, 0],
    svg: drum(s.c[0], s.c[1], s.r, 0, s.h) + flat([s.c[0] + s.r + 8, s.c[1] + 4], 0, name, "label"),
  })),
];

const svg = doc({
  label:
    "Request path on a single 2-core EC2 box: users hit nginx, which proxies upstream to two Node.js API workers in PM2 cluster mode, one per core; the workers read and write MongoDB Atlas and use Redis for caching and leaderboards.",
  layers: [base, traces, painted(parts)],
});

writeFileSync(OUT, svg);
console.log("wrote", OUT, `${(svg.length / 1024).toFixed(1)} KB`);
