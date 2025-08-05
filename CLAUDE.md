# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint on .js,.ts,.astro files
npm run check        # Run Astro type checking
npm run format       # Format code with Prettier
```

### Testing
```bash
npm run test:features    # Run Playwright tests
```

## Architecture Overview

### Core Technology Stack
- **Framework**: Astro 5.x with MDX support
- **Styling**: Scoped CSS with CSS Variables
- **Typography**: Self-hosted fonts via @fontsource
- **Content**: Markdown/MDX files in `src/content/blog/`

### Page & Component Structure

The site follows a two-column layout architecture:

1. **Layout.astro** - Main wrapper that orchestrates:
   - Font imports (Oswald, Roboto Condensed, Work Sans, JetBrains Mono)
   - Grid system with optional sidebar
   - SEO component integration
   - Theme persistence via inline script

2. **Blog Post Template** (`pages/blog/[...slug].astro`):
   - Dynamic routing using `getStaticPaths()` with import.meta.glob
   - Extracts reading time and headings during build
   - Table of contents generation from H2/H3 headings
   - Monumental red divider (6px thick) after header

3. **Content Processing**:
   - Blog posts live in `src/content/blog/` as .md or .mdx files
   - Frontmatter required: title, date, categories (optional: excerpt, tags)
   - Reading time calculated from extracted plain text
   - TOC generated from markdown headings

### Key Design System Elements

- **8-point grid system** (`--grid-unit: 8px`)
- **Accent color**: `#dc2626` (red) for headings and interactive elements
- **Typography hierarchy**: Uppercase headings with letter-spacing
- **Code blocks**: Black background with custom syntax highlighting

### Configuration

Central configuration in `src/config.ts`:
- Site metadata (title, description, author)
- Social links
- Site URL for production

### Build Configuration

The `astro.config.mjs` handles:
- Site URL from `process.env.SITE`
- Optional base path from `process.env.BASE_PATH` (for GitHub Pages)
- MDX integration
- Shiki syntax highlighting with github-dark theme

### Theme System

Dark mode support with:
- Theme persistence in localStorage
- Inline script prevents flash on load
- CSS custom properties for theming
- Special handling for category tags in dark mode