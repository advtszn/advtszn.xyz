# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses **Bun** as the package manager.

```bash
bun install          # Install dependencies
bun dev              # Dev server at localhost:4321
bun build            # Production build (fully static output in dist/)
bun preview          # Preview production build
bun astro [command]  # Astro CLI commands
```

## Architecture Overview

Personal portfolio site: **Astro 7** (fully static) + **TailwindCSS v4** + **MDX content collections**, deployed to **Vercel** as static files (no adapter, no server routes).

### Key Patterns

**Path Aliases**: Use `~/` for `src/` imports (e.g., `~/components/common/navbar.astro`).

**Content Collections** (`src/content.config.ts`):
- `writings` — MDX files in `src/content/writings/` (frontmatter: title, description, date, status, thumbnail, thumbnailAlt; images live in `src/content/writings/images/`). Rendered at `/writings/[slug]` via `getStaticPaths`.
- `works` — case studies as MDX files in `src/content/works/` (frontmatter: title, category, role, tech, url, date, featured, thumbnail, timeline, overview, contribution; the body is the long-form case study). Rendered at `/work/[slug]` via `getStaticPaths`. `~/lib/works` sorts them featured-first then newest-first — the ordering used by both `/works` and the home page. `/works` lists them as a static `WorkCard` grid (the same card used by the home page's works section). MDX bodies import optimized images from `src/assets/images/<slug>/` and reference raw video/PDF from `public/videos/` and `public/artifacts/`.

**Component Architecture**:
- `.astro` components only — there is no UI framework integration. Client interactivity is a `<script>` block in the `.astro` file (see the clock in `hero-section.astro`), re-bound on `astro:page-load` so it survives View Transitions.
- `Layout.astro` wraps all pages with navbar/sidebar and a global `lightbox.astro` (`<dialog>`-based; trigger with a `data-lightbox` attribute, optional `data-full` for the full-size src)
- `<ClientRouter />` enables View Transitions for SPA-like navigation

**Icons**: `lucide-astro`, plus custom SVG icons in `src/components/common/icons/`.

**Styling**:
- TailwindCSS v4 with OKLCH color tokens in `src/styles/global.css`
- Dark theme only (no light mode)
- Use `cn()` from `~/lib/utils` for conditional classnames
- Custom CSS: masonry layouts (`#masonry`), marquee animation, `.mdx` class for rendered MDX content

**Image Handling**:
- Use Astro's `astro:assets` for local images (auto-optimizes to WebP)
- `BlurImage` component adds LQIP placeholders (generated at build via `~/lib/lqip`)

**No runtime dependencies**: there is no CMS, no API routes, and no required environment variables — everything is resolved at build time.
