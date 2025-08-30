# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Swanage Traffic Alliance website - a brutalist-design activism site built with Astro. The project has two main directories:

- `sta-blocki/` - Original HTML prototype with inline CSS and JavaScript
- `site/` - Production Astro site with component-based architecture

## Development Commands

All commands run from the root directory:

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:4321)
npm run dev

# Build for production (outputs to ./dist/)
npm run build

# Preview production build locally
npm run preview

# Database migration scripts
npm run migrate-leads     # Migrate leads to database
npm run test-migration    # Test migration process
npm run simulate-traffic  # Simulate traffic for testing
```

## Architecture

### Page Structure
The site consists of five main pages:
- **Home** (`src/pages/index.astro`) - Landing page with data visualizations, impact analysis, and signup form
- **Feed** (`src/pages/feed.astro`) - Community voices with user counter and comment feed
- **News** (`src/pages/news.astro`) - Timeline of updates with alternating left/right layout
- **Privacy** (`src/pages/privacy.astro`) - Privacy policy page
- **Terms** (`src/pages/terms.astro`) - Terms of service page

### Component System
Located in `src/components/astro/`:
- **Layout Components**: `Header.astro`, `Footer.astro` - Site-wide navigation and branding
- **Data Components**: `DataBlock.astro`, `ImpactCard.astro` - Statistical displays and metrics
- **Container Components**: `BrutalSection.astro` - Consistent brutal design containers
- **Database Components**: `PageCounter.astro`, `ServerSideDB.astro` - Live data integration

### API Routes
Located in `src/pages/api/`:
- **Counter API** (`counter.ts`) - Page visit tracking with Neon database integration
- **Leads API** (`submit-lead.ts`, `get-leads.ts`) - Contact form submission handling

### Database Integration
- **Neon PostgreSQL** serverless database for production data storage
- **Database utilities** (`src/utils/database.ts`) - Connection management and query functions
- **Environment-aware configuration** - Supports multiple database URL formats for different deployment contexts

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

### Current Implementation
- **Live database integration** via Neon PostgreSQL serverless
- **Page visit tracking** stored in database with real-time updates
- **Contact form submissions** stored and retrievable via API endpoints
- **Mock data arrays** in page frontmatter for news items and some feed content

### CMS Integration
- **Decap CMS** (formerly Netlify CMS) integration for content management
- **OAuth authentication** via `astro-decap-cms-oauth` for admin access
- **Admin interface** available at `/admin/` route for content editing

### Development Scripts
Located in `scripts/` directory:
- **Migration utilities** for database schema and data migration
- **Testing scripts** for simulating traffic and validating data flow
- **TypeScript support** with tsx runner for development tooling

## Mobile Responsiveness

Breakpoint at 768px with specific adjustments:
- Timeline collapses to single column
- Grid layouts switch to single column
- Typography scales with clamp() functions
- Navigation header stacks vertically

## Development Environment

### Configuration Files
- **TypeScript** - Extends Astro's strict config (`tsconfig.json`)
- **Astro** - Server-side rendering with Vercel adapter (`astro.config.mjs`)
- **Environment Variables** - Multiple .env file support with database URL resolution
- **Build Process** - Includes Decap CMS asset copying in prebuild step

### Key Integrations
- **Vercel** deployment adapter for serverless functions
- **React** integration for interactive components when needed
- **Decap CMS OAuth** for content management authentication
- **TypeScript** strict mode for type safety across the application