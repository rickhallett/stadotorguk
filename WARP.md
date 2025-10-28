# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The Swanage Traffic Alliance website is a brutalist-design activism platform built with Astro 5.13.0. It combines static site generation with server-side functionality to create an impactful campaign site with real-time data visualization, community engagement features, and content management capabilities.

## Development Commands

All commands run from the root directory using Bun (preferred) or npm:

```bash
# Install dependencies
bun install

# Start development server (http://localhost:4321)
bun dev

# Build for production (outputs to ./dist/)
bun build

# Preview production build locally
bun preview

# Database operations
bun run migrate-leads      # Migrate leads from files to Neon database
bun run test-migration     # Test database migration process
bun run simulate-traffic   # Generate traffic simulation data

# Content management
# Access CMS at http://localhost:4321/admin (requires GitHub OAuth)

# TypeScript compilation
bun astro check           # Type checking
```

## Architecture Overview

### Core Technology Stack
- **Framework**: Astro 5.13.0 with server-side rendering
- **Database**: Neon PostgreSQL serverless for live data
- **Content**: Astro Content Collections with Zod validation
- **CMS**: Decap CMS with GitHub OAuth authentication
- **Styling**: Component-scoped CSS with brutalist design system
- **Deployment**: Vercel adapter with serverless functions

### High-Level Architecture
This is a **hybrid static/server-rendered site** with:
- Static pages for content (news, legal pages)
- Server-side API routes for dynamic data (counters, form submissions)
- Database integration for real-time statistics
- Content management via Git-based CMS

### Key Directories
- `src/pages/` - Route endpoints and page components
- `src/components/astro/` - Reusable UI components
- `src/components/react/` - Interactive React components  
- `src/pages/api/` - Server-side API endpoints
- `src/content/` - Content collections (news articles)
- `src/utils/` - Database utilities and shared functions
- `scripts/` - Migration and development utilities
- `public/admin/` - Decap CMS administration interface

## Database Operations

### Environment Setup
The database connection automatically resolves from multiple environment variable patterns:
- `DATABASE_URL` (primary)
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL` (Vercel)
- `POSTGRES_URL_NON_POOLING`, `DATABASE_URL_UNPOOLED` (fallbacks)

### Key Database Functions
```typescript
// In src/utils/database.ts
getLeadCount()           // Total supporter count
createLead(leadData)     // Add new supporter
getMemberStats()         // Comprehensive analytics
getPageCount()           // Site visit tracking
incrementPageCount()     // Track page views
```

### Migration Workflow
1. Content initially stored as markdown files in `src/content/leads/`
2. Migration script transfers data to Neon database
3. Live site uses database for real-time statistics
4. CMS continues to manage other content types

## Content Management

### Decap CMS Access
- **URL**: `/admin` route
- **Authentication**: GitHub OAuth (configured in astro.config.mjs)
- **Configuration**: `public/admin/config.yml`
- **Collections**: News articles, with leads transitioning to database

### Content Collections
```typescript
// Defined in src/content/config.ts
news: {
  date: Date,
  title: string,
  published: boolean
}
```

### Adding Content
1. **Via CMS**: Access `/admin`, authenticate, create/edit content
2. **Via Files**: Add markdown files to `src/content/news/`
3. **Database Content**: Use API endpoints or migration scripts

## Component Architecture

### Layout System
- **Layout.astro**: Main page wrapper with SEO metadata
- **Header.astro**: Site navigation with responsive mobile menu
- **Footer.astro**: Campaign branding and calls-to-action

### Data Components
- **DataBlock.astro**: Large statistical displays with animations
- **ImpactCard.astro**: Visual impact cards with icons
- **BrutalSection.astro**: Consistent brutalist design containers
- **PageCounter.tsx**: React component for live visitor counting

### API Integration Components
- **ServerSideDB.astro**: Server-side data fetching
- Components automatically handle database connection and error states

## Styling System

### Brutalist Design Principles
```css
/* Core variables in src/styles/global.css */
--brutal-black: #0066cc;        /* Primary blue */
--brutal-white: #ffffff;
--brutal-red: #ff0000;          /* Alert color */
--brutal-shadow: rgba(0,102,204,0.3);

/* Standard brutalist container */
border: 8px solid var(--brutal-black);
box-shadow: 15px 15px 0 var(--brutal-shadow);
```

### Responsive Design
- **Mobile-first**: < 768px single column layouts
- **Desktop**: ≥ 768px multi-column grids
- **Typography**: Responsive scaling with `clamp()` functions
- **Navigation**: Collapsible mobile menu system

## API Routes

### Available Endpoints
- `GET/POST /api/counter` - Page visit tracking with increment capability
- `GET/POST /api/submit-lead` - Contact form submission handling
- `GET /api/get-leads` - Retrieve supporter data for display

### API Pattern
```typescript
// Standard API route structure
export const GET: APIRoute = async ({ request }) => {
  // Handle database operations
  // Return JSON with CORS headers
  // Include error handling with fallbacks
}
```

## Development Workflow

### Local Development
1. Clone repository and run `bun install`
2. Set up `.env.local` with `DATABASE_URL` for database features
3. Run `bun dev` for development server with hot reloading
4. Access CMS at `/admin` (requires GitHub OAuth setup)

### Database Development
1. Use `bun run test-migration` to validate database operations
2. Run `bun run migrate-leads` to transfer file-based data to database
3. Monitor database queries through Neon dashboard
4. Use `bun run simulate-traffic` for load testing

### Content Development
1. Edit content via CMS at `/admin` or directly in markdown files
2. Test builds with `bun build` before deployment
3. Use `bun preview` to test production builds locally

### Build Process
The build includes:
- Pre-build step copies Decap CMS assets to public directory
- Astro processes all routes and content collections
- Database connections validated at build time
- Static assets optimized and bundled

## Testing and Debugging

### Common Issues
- **Database Connection**: Verify environment variables are properly set
- **CMS Access**: Ensure GitHub OAuth is configured in astro.config.mjs
- **Build Failures**: Check TypeScript errors with `bun astro check`

### Migration Testing
```bash
bun run test-migration    # Dry run database operations
bun run migrate-leads     # Full migration with progress logging
```

### Performance Monitoring
- Monitor database query performance through Neon dashboard
- Check API endpoint response times in development
- Use browser dev tools for client-side performance analysis

## Deployment

### Vercel Configuration
- **Build Command**: `bun build`
- **Output Directory**: `dist`
- **Node Version**: 18+
- **Environment**: Serverless functions enabled

### Environment Variables
Required for production:
- `DATABASE_URL` - Neon database connection string
- GitHub OAuth credentials (configured via Vercel dashboard)

### Post-Deployment
- Verify `/admin` CMS access
- Test API endpoints functionality
- Monitor database connections
- Validate form submissions and counter operations

## Key Implementation Notes

### Server vs Static Rendering
The site uses Astro's server output mode (`output: "server"`) to support:
- API routes for database operations
- OAuth authentication for CMS
- Real-time data fetching in components

### Database Strategy
- **Live Data**: Page counters, supporter statistics, form submissions
- **Static Content**: News articles, legal pages via content collections
- **Hybrid Approach**: CMS for editorial content, database for user-generated data

### Performance Considerations
- Database queries optimized with single query for complex statistics
- Page caching configured for API endpoints (60-second TTL)
- Component-scoped CSS reduces bundle size
- Progressive enhancement with minimal JavaScript
