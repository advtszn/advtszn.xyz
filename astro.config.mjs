// @ts-check

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://advtszn.xyz",
  output: "server",
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  adapter: vercel({ webAnalytics: { enabled: true } }),
});
