# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Swanage Traffic Alliance website - a brutalist-design activism site built with Astro. The project has two main directories:

- `sta-blocki/` - Original HTML prototype with inline CSS and JavaScript
- `site/` - Production Astro site with component-based architecture

## Development Commands

All commands run from the `site/` directory:

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:4321)
npm run dev

# Build for production (outputs to ./dist/)
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Page Structure
The site consists of three main pages:
- **Home** (`src/pages/index.astro`) - Landing page with data visualizations, impact analysis, and signup form
- **Feed** (`src/pages/feed.astro`) - Community voices with user counter and comment feed
- **News** (`src/pages/news.astro`) - Timeline of updates with alternating left/right layout

### Component System
Located in `src/components/`:
- **Layout Components**: `Header.astro`, `Footer.astro` - Site-wide navigation and branding
- **Data Components**: `DataBlock.astro`, `ImpactCard.astro` - Statistical displays
- **Container Components**: `BrutalSection.astro` - Consistent brutal design containers

### Styling Approach
- Global styles in `src/styles/global.css` define CSS variables and base typography
- Component-scoped styles within each `.astro` file
- Brutalist design system using:
  - Heavy borders (8px solid black)
  - Box shadows (15px offsets)
  - Limited color palette (black, white, red, gray, concrete)
  - Bold typography (Arial Black, uppercase, tight letter-spacing)

### Key Design Patterns

**Brutalist Containers**: All sections use 8px borders with heavy shadows:
```css
border: 8px solid var(--brutal-black);
box-shadow: 15px 15px 0 var(--brutal-shadow);
```

**Timeline Layout**: News page uses alternating left/right positioning:
- Desktop: Items alternate sides with center timeline
- Mobile: All items align left with timeline on left edge

**Form Handling**: Contact forms use client-side JavaScript for immediate feedback with 5-second confirmation display

**Animation Strategy**: 
- Intersection Observer for scroll-triggered animations
- Counter animations on Feed page
- Staggered delays for sequential content reveal

## Data Management

Currently uses mock data arrays in page frontmatter. When implementing backend:
- Feed items in `feed.astro` should connect to user submission database
- News items in `news.astro` should be managed through CMS or markdown files
- User counters should pull from authentication system

## Mobile Responsiveness

Breakpoint at 768px with specific adjustments:
- Timeline collapses to single column
- Grid layouts switch to single column
- Typography scales with clamp() functions
- Navigation header stacks vertically