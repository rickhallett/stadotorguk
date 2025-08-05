# Template Conversion Todo List

## Phase 1: Project Setup and Rebranding

### 1.1 Clean Up Project
- [ ] Delete all markdown and MDX files from `/src/content/blog/`
- [ ] Delete `/src/pages/about.astro`
- [ ] Delete `/src/pages/blog.astro`
- [ ] Delete `/src/pages/categories.astro`
- [ ] Delete `/src/pages/contact.astro`
- [ ] Delete `/src/pages/rss.xml.js`
- [ ] Delete `/src/pages/search.json.js`
- [ ] Delete `/src/pages/blog/` directory
- [ ] Delete `/src/pages/categories/` directory

### 1.2 Rebrand Configuration
- [ ] Update `src/config.ts` - Change title to "Swanage Traffic Alliance"
- [ ] Update `src/config.ts` - Change description to accountability message
- [ ] Update `src/config.ts` - Update author name to "Swanage Traffic Alliance"
- [ ] Update `src/config.ts` - Update author bio to collective description
- [ ] Update `src/config.ts` - Clear social GitHub link
- [ ] Update `src/config.ts` - Clear social Twitter link
- [ ] Update `src/config.ts` - Set email to "contact@swanagetraffic.co.uk"
- [ ] Update `src/config.ts` - Set siteUrl to "https://www.swanagetraffic.co.uk"

### 1.3 Update Visual Branding
- [ ] Replace `/public/favicon.svg` with new logo
- [ ] Create/replace `/public/site-title.svg` with "SWANAGE TRAFFIC ALLIANCE" text
- [ ] Change `--color-accent-red` to `#3498db` in `/src/styles/global.css`
- [ ] Rename `--color-accent-red` to `--color-accent` in global.css
- [ ] Search and replace all instances of `--color-accent-red` with `--color-accent` in all .astro files
- [ ] Search and replace all instances of `--color-accent-red` with `--color-accent` in all .css files

### 1.4 Update README
- [ ] Replace README.md content with Swanage Traffic Alliance project description

## Phase 2: Build the Homepage

### 2.1 Restructure the Homepage
- [ ] Open `/src/pages/index.astro`
- [ ] Remove "Demo" section from index.astro
- [ ] Remove "Features" section from index.astro
- [ ] Remove "Typography Showcase" section from index.astro
- [ ] Remove "Installation" section from index.astro
- [ ] Keep "Hero" section in index.astro

### 2.2 Create Homepage Components
- [ ] Create directory `/src/components/home/`

#### Hero Component
- [ ] Create `/src/components/home/Hero.astro`
- [ ] Copy structure from existing hero section
- [ ] Update title to "DEMANDING ACCOUNTABILITY"
- [ ] Update subtitle to "The Democratic Process Has Been Warped For Personal Gain"
- [ ] Update description to evidence message
- [ ] Remove buttons from hero

#### Impact Map Component
- [ ] Create `/src/components/home/ImpactMap.astro`
- [ ] Copy HTML structure from old site's impact-map-section
- [ ] Copy CSS from old site's impact-map.css into component
- [ ] Copy `impact_non_sat_height.webp` to `/public/images/`
- [ ] Copy `impact_non_sat_height_compressed.png` to `/public/images/`
- [ ] Adapt JavaScript for initializeImpactMapToggle function
- [ ] Adapt JavaScript for loadImpactMap function
- [ ] Update image paths to `/images/` in component

#### Community Counter Component
- [ ] Create `/src/components/home/CommunityCounter.astro`
- [ ] Copy HTML from old site's community-counter section
- [ ] Copy CSS from old site's counter.css
- [ ] Add client-side script to fetch from `/api/get-count`
- [ ] Implement getParticipantCount logic
- [ ] Implement counter display update logic

#### Testimonials Component
- [ ] Create `/src/components/home/Testimonials.astro`
- [ ] Copy HTML from old site's thought-bubbles-section
- [ ] Copy CSS from old site's thought-bubbles.css
- [ ] Add first testimonial about voices being ignored
- [ ] Add second testimonial about data presentation
- [ ] Add third testimonial about transparency demand

### 2.3 Assemble the Homepage
- [ ] Import Hero component in index.astro
- [ ] Import ImpactMap component in index.astro
- [ ] Import CommunityCounter component in index.astro
- [ ] Import Testimonials component in index.astro
- [ ] Arrange components in Layout within index.astro

## Phase 3: Build the Feeds Page

### 3.1 Create the Feeds Page File
- [ ] Create `/src/pages/feeds.astro`

### 3.2 Create Feeds Page Components
- [ ] Create directory `/src/components/feeds/`

#### Feeds Hero Component
- [ ] Create `/src/components/feeds/FeedsHero.astro`
- [ ] Add page title structure
- [ ] Add Total Participants statistic
- [ ] Add Joined Today statistic
- [ ] Add This Week statistic
- [ ] Add client-side script to fetch from `/api/get-all-participants`

#### Momentum Graph Component
- [ ] Install chart.js dependency: `npm install chart.js`
- [ ] Create `/src/components/feeds/MomentumGraph.astro`
- [ ] Add canvas element for Chart.js
- [ ] Add client-side script to fetch participant data
- [ ] Implement cumulative data processing logic
- [ ] Implement chart rendering logic from old feeds-page.js

#### Hot Topics Component
- [ ] Create `/src/components/feeds/HotTopics.astro`
- [ ] Add loading state UI
- [ ] Add fetch logic for `/api/analyze-concerns`
- [ ] Implement topic rendering logic
- [ ] Copy relevant CSS from old feeds.css

#### Participants Grid Component
- [ ] Create `/src/components/feeds/ParticipantsGrid.astro`
- [ ] Add grid structure for participant cards
- [ ] Add fetch logic for `/api/get-all-participants`
- [ ] Implement participant card rendering
- [ ] Add comment display functionality

### 3.3 Assemble the Feeds Page
- [ ] Import FeedsHero component in feeds.astro
- [ ] Import MomentumGraph component in feeds.astro
- [ ] Import HotTopics component in feeds.astro
- [ ] Import ParticipantsGrid component in feeds.astro
- [ ] Arrange components in Layout within feeds.astro

### 3.4 Update Navigation
- [ ] Open `/src/components/Header.astro`
- [ ] Add "Home" link to nav-list
- [ ] Add "Feeds" link to nav-list
- [ ] Update mobile menu with "Home" link
- [ ] Update mobile menu with "Feeds" link

## Phase 4: Implement Serverless API Endpoints

### 4.1 Create API Endpoints
- [ ] Create `/src/pages/api/` directory if not exists
- [ ] Create `/src/pages/api/get-all-participants.js`
- [ ] Copy code from old get-all-participants.js
- [ ] Export handler as GET function
- [ ] Update to use `import.meta.env` for env variables

- [ ] Create `/src/pages/api/analyze-concerns.js`
- [ ] Copy code from old analyze-concerns.js
- [ ] Export handler as GET function
- [ ] Update to use `import.meta.env` for env variables

### 4.2 Environment Configuration
- [ ] Create `.env.example` file in project root
- [ ] Add NOTION_TOKEN to .env.example
- [ ] Add NOTION_DATABASE_ID to .env.example
- [ ] Add ANTHROPIC_API_KEY to .env.example
- [ ] Document need for .env file with real values

## Phase 5: Finalization

### 5.1 Review and Refine Copy
- [ ] Review all text on index.astro
- [ ] Review all text on feeds.astro
- [ ] Ensure accountability tone consistency
- [ ] Replace old survey references with evidence sharing calls
- [ ] Add community story submission prompts

### 5.2 Final Cleanup
- [ ] Check if TableOfContents.astro is still needed
- [ ] Check if SEO.astro needs adjustments
- [ ] Remove any unused components from original theme
- [ ] Remove dead code from CSS files
- [ ] Remove unused CSS variables

### 5.3 Test
- [ ] Run `npm run dev`
- [ ] Test homepage loads correctly
- [ ] Test feeds page loads correctly
- [ ] Verify API data loading on homepage
- [ ] Verify API data loading on feeds page
- [ ] Check browser console for errors
- [ ] Test mobile navigation menu
- [ ] Test responsive layout
- [ ] Verify all images load correctly
- [ ] Test interactive elements (map toggle, etc.)

## Verification Checklist
- [ ] All old blog content removed
- [ ] Config reflects new organization
- [ ] Blue accent color applied throughout
- [ ] Homepage has all 4 main components
- [ ] Feeds page displays data correctly
- [ ] Navigation updated with new pages
- [ ] API endpoints functional
- [ ] No console errors in development
- [ ] Site ready for deployment