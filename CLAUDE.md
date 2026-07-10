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

Personal portfolio site: **Astro 7** (fully static) + **React islands** + **TailwindCSS v4** + **MDX content collections**, deployed to **Vercel** as static files (no adapter, no server routes).

### Key Patterns

**Path Aliases**: Use `~/` for `src/` imports (e.g., `~/components/common/navbar.astro`).

**Content Collections** (`src/content.config.ts`):
- `writings` — MDX files in `src/content/writings/` (frontmatter: title, description, date, status, thumbnail, thumbnailAlt; images live in `src/content/writings/images/`). Rendered at `/writings/[slug]` via `getStaticPaths`.
- `works` — MDX files in `src/content/works/` (frontmatter: title, role, date, url; the body is the description). The works page renders each description server-side and passes them as hidden slot children into the `WorksList` React island, which toggles visibility client-side.

**Component Architecture**:
- `.astro` components for static/server content
- `.tsx` React islands for client interactivity (use `client:load` directive)
- `Layout.astro` wraps all pages with navbar/sidebar/footer and a global `lightbox.astro` (`<dialog>`-based; trigger with a `data-lightbox` attribute, optional `data-full` for the full-size src)
- `<ClientRouter />` enables View Transitions for SPA-like navigation

**Icons**:
- `.astro` files use `lucide-astro` (and custom SVG icons in `src/components/common/icons/`)
- `.tsx` React islands use `lucide-react`

**Styling**:
- TailwindCSS v4 with OKLCH color tokens in `src/styles/global.css`
- Dark theme only (no light mode)
- Use `cn()` from `~/lib/utils` for conditional classnames
- Custom CSS: masonry layouts (`#masonry`), marquee animation, `.mdx` class for rendered MDX content

**Image Handling**:
- Use Astro's `astro:assets` for local images (auto-optimizes to WebP)
- `BlurImage` component adds LQIP placeholders (generated at build via `~/lib/lqip`)

**No runtime dependencies**: there is no CMS, no API routes, and no required environment variables — everything is resolved at build time.
