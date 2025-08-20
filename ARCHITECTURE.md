# Project Architecture

## Last Updated: 2025-08-20
## Version: 1.0.0

## 1. High-Level Overview

### 1.1 System Purpose
The Swanage Traffic Alliance (STA) website is a brutalist-design activism platform built to raise awareness about traffic congestion issues in Swanage. It provides data visualization, community engagement features, and campaign management tools to mobilize local support for traffic reform.

### 1.2 Core Technologies
- **Framework**: Astro 5.13.0 (Static Site Generator with component islands)
- **Styling**: Scoped CSS with global variables, brutalist design system
- **Content Management**: Decap CMS (formerly Netlify CMS) with GitHub backend
- **Data**: Astro Content Collections with Zod schema validation
- **Build Tools**: Vite (via Astro), Node.js
- **Authentication**: GitHub OAuth (for CMS access)

### 1.3 Architecture Pattern
- **Pattern**: Component-based architecture with content-driven pages
- **Key Decisions**:
  - Static generation for performance and SEO
  - File-based content management with Git versioning
  - Component islands for interactive elements
  - Multiple design variants (v1-v5) for A/B testing
- **Design Principles**:
  - Brutalist aesthetic with heavy borders and bold typography
  - Mobile-first responsive design
  - Progressive enhancement with JavaScript
  - Accessibility through semantic HTML

## 2. Medium-Level Architecture

### 2.1 Directory Structure
```
stadotcouk/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── BrutalSection.astro  # Container with brutalist styling
│   │   ├── DataBlock.astro      # Statistics display component
│   │   ├── Footer.astro         # Site footer with branding
│   │   ├── Header.astro         # Navigation header
│   │   └── ImpactCard.astro     # Impact visualization cards
│   ├── content/         # Content collections (markdown/frontmatter)
│   │   ├── config.ts    # Collection schemas with Zod
│   │   ├── feed/        # Community voice submissions
│   │   ├── leads/       # Campaign supporter data
│   │   ├── news/        # Timeline updates
│   │   └── settings/    # Site configuration
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro # Main wrapper with SEO metadata
│   ├── pages/           # Route endpoints
│   │   ├── index.astro  # Homepage with data viz
│   │   ├── feed.astro   # Community voices page
│   │   ├── news.astro   # News timeline page
│   │   ├── variants.astro      # Variant selector
│   │   ├── supporters/         # Paginated supporter lists
│   │   └── v1-v5/              # Design variant directories
│   └── styles/          # Global styles
│       └── global.css   # CSS variables and base styles
├── public/              # Static assets
│   ├── admin/           # Decap CMS interface
│   │   ├── config.yml   # CMS configuration
│   │   ├── decap-cms.js # CMS JavaScript bundle
│   │   └── index.html   # CMS entry point
│   └── uploads/         # Media storage
├── scripts/             # Build and data scripts
│   └── import-leads.js  # CSV to markdown converter
├── specs/               # Project specifications
│   └── feed-design.prd.md # Product requirements
├── dist/                # Production build output
└── .claude/             # Claude Code configuration
```

### 2.2 Component Hierarchy

#### Layout Components
- **Layout.astro**: Main page wrapper providing consistent structure
  - Props: title, description, ogImage
  - Includes global styles and meta tags
  - Wraps all page content

#### Navigation Components
- **Header.astro**: Site-wide navigation bar
  - Links to main pages (Home, Feed, News, Supporters)
  - Responsive mobile menu
  - Brutalist styling with heavy borders

#### Content Components
- **BrutalSection.astro**: Reusable content container
  - Consistent brutalist styling (8px borders, heavy shadows)
  - Configurable background colors
  - Animation on scroll

- **DataBlock.astro**: Statistical data display
  - Large numeric displays with labels
  - Used for traffic statistics and impact metrics
  
- **ImpactCard.astro**: Visual impact representations
  - Icon-based cards showing consequences
  - Grid layout with hover effects

#### Utility Components
- **Footer.astro**: Site footer with campaign branding
  - Call-to-action messaging
  - Copyright information

### 2.3 Data Flow

#### Content Sourcing
1. **Build-time Data**:
   - Content Collections loaded from markdown files
   - Processed through Zod schemas for validation
   - Transformed into type-safe data structures

2. **CMS Integration**:
   - Decap CMS provides admin interface at `/admin`
   - GitHub OAuth for authentication
   - Direct commits to repository on content changes
   - Triggers rebuild on content updates

3. **Data Import Pipeline**:
   - CSV imports via `scripts/import-leads.js`
   - Converts supporter data to markdown frontmatter
   - Maintains unique IDs and timestamps

#### State Management
- No client-side state management library
- Form states handled with vanilla JavaScript
- Counter animations use Intersection Observer API
- All data fetched at build time

### 2.4 Routing Strategy

#### Static Routes
- `/` - Homepage with data visualizations
- `/feed` - Community voices page
- `/news` - News timeline
- `/variants` - Design variant selector
- `/supporters` - Paginated supporter lists

#### Dynamic Routes
- `/supporters/[...page]` - Pagination for supporter lists
- `/v1` through `/v5` - Design variant versions

#### Content-based Routes
- News items accessible via content collections
- Feed items queryable by date and status
- Supporter data filterable by visitor type

## 3. Low-Level Implementation Details

### 3.1 Component Patterns

#### Astro Component Structure
```astro
---
// Frontmatter: Server-side logic
import { getCollection } from 'astro:content';
const posts = await getCollection('news');

// Component props interface
interface Props {
  title: string;
  background?: string;
}

const { title, background = 'white' } = Astro.props;
---

<!-- Template: HTML structure -->
<section class="brutal-section">
  <h2>{title}</h2>
  <slot /> <!-- Child content -->
</section>

<style>
  /* Scoped styles */
  .brutal-section {
    border: 8px solid var(--brutal-black);
    box-shadow: 15px 15px 0 var(--brutal-shadow);
  }
</style>

<script>
  /* Client-side JavaScript */
  // Intersection Observer for animations
</script>
```

### 3.2 Naming Conventions

#### Files and Directories
- **Components**: PascalCase (e.g., `BrutalSection.astro`)
- **Pages**: kebab-case (e.g., `news.astro`)
- **Content**: date-prefixed kebab-case (e.g., `2024-08-01-sta-unified-resistance.md`)
- **Scripts**: kebab-case (e.g., `import-leads.js`)

#### CSS Classes
- **Global utilities**: `.brutal-headline`, `.brutal-section`
- **Component-specific**: Scoped within components
- **State modifiers**: `.is-active`, `.has-error`

#### JavaScript
- **Functions**: camelCase (e.g., `animateCounter()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ANIMATION_DURATION`)
- **Event handlers**: `handle` prefix (e.g., `handleSubmit()`)

### 3.3 Key Components

#### Layout.astro
- **Purpose**: Main page wrapper with SEO and meta tags
- **Props**: 
  - `title`: Page title for SEO
  - `description`: Meta description
  - `ogImage`: Open Graph image URL
- **Features**:
  - Responsive viewport meta
  - Favicon inclusion
  - Global CSS import
  - Structured data support

#### BrutalSection.astro
- **Purpose**: Consistent brutalist design container
- **Props**:
  - `title`: Section heading
  - `background`: Background color (white/concrete/gray)
  - `animate`: Enable scroll animations
- **Usage**: Wraps all major content sections for visual consistency

#### Header.astro
- **Purpose**: Site navigation and branding
- **Features**:
  - Responsive navigation menu
  - Active page highlighting
  - Mobile hamburger menu
  - Admin link for CMS access

### 3.4 Content Collections

#### Schema Definitions

**News Collection** (`news`):
```typescript
{
  date: Date,           // Publication date
  title: string,        // Article headline
  published: boolean    // Visibility flag
}
```

**Feed Collection** (`feed`):
```typescript
{
  username: string,     // Display name
  location: string,     // User location
  timestamp: Date,      // Submission time
  comment: string,      // User testimony
  published: boolean    // Moderation status
}
```

**Leads Collection** (`leads`):
```typescript
{
  timestamp: Date,      // Submission time
  user_id: string,      // Unique identifier
  name: string,         // Full name
  first_name: string,   
  last_name: string,
  email: string,        // Contact email
  visitor_type: enum,   // Local/Visitor/Tourist/Other
  comments?: string,    // Optional feedback
  referral_code?: string,
  source: string,       // Acquisition channel
  submission_id: string,
  published: boolean
}
```

### 3.5 Styling Architecture

#### CSS Variables (Theme System)
```css
:root {
  --brutal-black: #0066cc;        /* Primary blue */
  --brutal-white: #ffffff;         
  --brutal-red: #ff0000;           /* Warning color */
  --brutal-gray: #4caf50;          /* Green accent */
  --brutal-concrete: #fff8dc;      /* Light golden */
  --brutal-shadow: rgba(0,102,204,0.3);
}
```

#### Typography Scale
- **Headlines**: `clamp(4rem, 12vw, 10rem)` - Responsive scaling
- **Subheads**: `clamp(1.5rem, 4vw, 3rem)`
- **Body**: System default with Arial Black fallback
- **Data**: `clamp(3rem, 8vw, 6rem)` - Large statistics

#### Responsive Breakpoints
- **Mobile**: < 768px (single column layouts)
- **Desktop**: ≥ 768px (multi-column grids)
- **Wide**: > 1200px (max content width)

#### Animation Patterns
- Intersection Observer for scroll-triggered animations
- CSS transitions for hover states
- JavaScript counters for number animations
- Staggered delays using CSS custom properties

### 3.6 Build Pipeline

#### Development Workflow
```bash
npm run dev
# Starts Astro dev server on http://localhost:4321
# Hot module replacement enabled
# TypeScript checking in IDE
```

#### Production Build
```bash
npm run build
# Pre-build: Copies Decap CMS assets
# Build: Static site generation to ./dist
# Optimizations: Minification, tree-shaking
```

#### Preview Mode
```bash
npm run preview
# Serves production build locally
# Useful for testing before deployment
```

## 4. External Integrations

### 4.1 Third-party Services

#### Decap CMS (Content Management)
- **Purpose**: Provides admin interface for content editing
- **Authentication**: GitHub OAuth
- **Configuration**: `/public/admin/config.yml`
- **Collections**: News, Feed, Leads
- **Media**: Stored in `/public/uploads`

#### GitHub Integration
- **Repository**: `rickhallett/stadotorguk`
- **Branch Strategy**: `dev` for development, `main` for production
- **OAuth**: Astro integration for CMS authentication
- **Webhooks**: Trigger rebuilds on content changes

### 4.2 Dependencies

#### Core Dependencies
- **astro** (^5.13.0): Static site generator framework
- **astro-decap-cms-oauth** (^0.5.1): OAuth provider for CMS
- **decap-cms** (^3.8.3): Git-based content management
- **csv-parse** (^6.1.0): CSV data import utilities

#### Build Dependencies
- **Vite**: Bundler (included with Astro)
- **TypeScript**: Type checking (Astro built-in)
- **Zod**: Runtime schema validation

## 5. Performance Considerations

### 5.1 Optimization Strategies

#### Static Generation
- All pages pre-rendered at build time
- No server-side rendering overhead
- CDN-friendly output

#### Asset Optimization
- CSS scoped to components (reduced specificity conflicts)
- Minimal JavaScript (progressive enhancement)
- No runtime framework overhead

#### Code Splitting
- Component-level code splitting via Astro Islands
- Lazy-loaded interactive components
- Critical CSS inlined

### 5.2 Bundle Size
- **HTML**: ~10-20KB per page (uncompressed)
- **CSS**: ~15KB global + component styles
- **JavaScript**: Minimal, only for interactions
- **Total First Load**: < 100KB compressed

## 6. Security Considerations

### 6.1 Data Handling

#### Input Validation
- Zod schemas validate all content at build time
- Email validation patterns in CMS configuration
- Sanitized markdown rendering

#### Authentication
- GitHub OAuth for CMS access only
- No user authentication on public site
- Admin route protected by external OAuth

### 6.2 Environment Variables
- **Required**: None for basic operation
- **OAuth Config**: Handled by Astro integration
- **Production**: Set via hosting platform

## 7. Development Workflow

### 7.1 Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access site at http://localhost:4321
# Access CMS at http://localhost:4321/admin
```

### 7.2 Content Management
1. Access `/admin` route
2. Authenticate with GitHub
3. Edit content through GUI
4. Changes commit directly to repository
5. Rebuild triggered automatically

### 7.3 Deployment
- **Platform**: Vercel (configured via `vercel.json`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Node.js 18+

## 8. Maintenance & Evolution

### 8.1 Technical Debt
- **Known Issues**:
  - Large number of lead files may impact build performance
  - Variant system could be refactored to use dynamic routing
  - No automated testing suite

### 8.2 Scalability Considerations
- **Content Growth**: File-based system may need database at scale
- **Media Storage**: Consider CDN for uploads directory
- **Build Times**: May need incremental builds for large datasets

### 8.3 Migration Paths
- **Database Integration**: Could migrate to Astro DB for dynamic content
- **API Layer**: Add API routes for real-time data
- **Authentication**: Implement user accounts for personalization
- **Analytics**: Integrate privacy-respecting analytics

## 9. Design Variants System

### 9.1 Purpose
The site includes 5 design variants (v1-v5) for A/B testing different visual approaches while maintaining the core brutalist aesthetic.

### 9.2 Implementation
- Each variant is a complete copy in `/src/pages/v[1-5]/`
- Variants accessible via URL paths (e.g., `/v1`, `/v2`)
- Variant selector at `/variants` for testing
- Shared components ensure consistency

### 9.3 Variant Differences
- **Color Schemes**: Different primary colors (blue, black, variations)
- **Shadow Styles**: Varying shadow intensities and colors
- **Typography**: Different font weights and letter spacing
- **Layout**: Minor spacing and alignment adjustments

## 10. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-08-20 | 1.0.0 | Initial architecture documentation | Claude Code |