# Product Requirements Document: Movement Counter Relocation

## Executive Summary
This PRD documents the relocation of the "OUR MOVEMENT IS GROWING" counter block from the `/supporters` page to the `/feed` page, positioning it between the "COMMUNITY VOICES" hero section and "THE UNCONSULTED MAJORITY" section. This change will increase visibility of the growing supporter count on the more frequently visited feed page.

## Problem Statement

### Current Issues
1. **Low Visibility**: The movement counter is currently on the `/supporters` page, which receives less traffic than the main feed page
2. **Disconnect from Activity**: The counter showing growing support is separated from the active community voices and testimonials
3. **User Journey**: Users viewing community feedback don't immediately see the scale of the movement

### User Pain Points
- Users don't realize the scale of community support when browsing testimonials
- The growing movement metric lacks prominence in the user flow
- Connection between individual voices and collective action is not clear

## Requirements

### Functional Requirements

#### 1. Component Relocation
- Move the entire "OUR MOVEMENT IS GROWING" section from `/supporters/index.astro`
- Insert between existing sections on `/feed.astro`:
  - After: "COMMUNITY VOICES" hero section
  - Before: "THE UNCONSULTED MAJORITY" counter section

#### 2. Data Integration
- Fetch total supporter count from leads collection
- Maintain real-time counter animation functionality
- Preserve number formatting and visual styling

#### 3. Section Structure
```
FEED PAGE LAYOUT:
1. COMMUNITY VOICES (hero)
2. OUR MOVEMENT IS GROWING (relocated) ← NEW POSITION
3. THE UNCONSULTED MAJORITY (counters)
4. LATEST REPORTS (feed items)
5. ADD YOUR VOICE (CTA)
```

### Technical Requirements

#### 1. Data Fetching
```typescript
// Add to feed.astro frontmatter
import { getCollection } from 'astro:content';

// Get total supporter count
const allLeads = await getCollection('leads', ({ data }) => data.published);
const totalSupporters = allLeads.length;
```

#### 2. Component HTML Structure
```html
<BrutalSection title="OUR MOVEMENT IS GROWING">
    <div class="movement-section">
        <div class="movement-number" data-target={totalSupporters}>0</div>
        <p class="movement-subtitle">VOTERS STANDING WITH US</p>
        <div class="movement-cta">
            <a href="/supporters" class="view-supporters-btn">
                SEE WHO'S JOINED
            </a>
        </div>
    </div>
</BrutalSection>
```

#### 3. JavaScript Animation
```javascript
// Counter animation (to be added to feed.astro script section)
function animateMovementCounter() {
    const counter = document.querySelector('.movement-number');
    if (!counter) return;
    
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target.toLocaleString();
        }
    };
    
    // Trigger on intersection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateCounter();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(counter);
}

// Call on DOMContentLoaded
window.addEventListener('DOMContentLoaded', animateMovementCounter);
```

### Design Requirements

#### Visual Specifications
```css
.movement-section {
    text-align: center;
    padding: 3rem 0;
}

.movement-number {
    font-family: 'Arial Black', sans-serif;
    font-size: clamp(5rem, 12vw, 10rem);
    color: #FFD700; /* Golden yellow - positive growth */
    line-height: 1;
    margin: 1rem 0;
    font-weight: 900;
    letter-spacing: -0.05em;
}

.movement-subtitle {
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--brutal-black);
    margin-bottom: 2rem;
}

.movement-cta {
    margin-top: 2rem;
}

.view-supporters-btn {
    display: inline-block;
    background: var(--brutal-black);
    color: var(--brutal-white);
    padding: 1rem 2rem;
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 4px solid var(--brutal-black);
    box-shadow: 8px 8px 0 var(--brutal-shadow);
    transition: all 0.2s;
}

.view-supporters-btn:hover {
    background: var(--brutal-gray);
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0 var(--brutal-shadow);
}
```

## Implementation Notes

### Migration Steps
1. **Extract Component**: Copy the movement counter section from `/supporters/index.astro` (lines 39-43, 159-164)
2. **Add Data Fetching**: Import leads collection in feed.astro frontmatter
3. **Insert Section**: Place between hero and existing counter sections
4. **Move JavaScript**: Transfer counter animation logic to feed page
5. **Add Styling**: Include component-specific CSS in feed.astro style block
6. **Test Animation**: Verify Intersection Observer triggers correctly
7. **Update Supporters Page**: Remove or replace the section on supporters page

### Code Location Map
- **Source**: `/src/pages/supporters/index.astro` (lines 39-43, styles 146-172, script 404-432)
- **Destination**: `/src/pages/feed.astro` (insert after line 79, before line 81)
- **Affected Files**:
  - `/src/pages/feed.astro` - Add section
  - `/src/pages/supporters/index.astro` - Update/remove section

## Responsive Design

### Mobile Layout (< 768px)
- Number size: `clamp(4rem, 12vw, 10rem)` ensures readability
- Subtitle: Scales down appropriately
- Button: Full width on mobile
- Padding: Reduced for mobile screens

### Desktop Layout (≥ 768px)
- Centered layout with maximum width
- Large impactful number display
- Hover effects on CTA button
- Optimal spacing and visual hierarchy

## Accessibility Considerations

1. **ARIA Labels**: Add aria-label to counter for screen readers
2. **Live Region**: Mark counter as aria-live="polite" for updates
3. **Semantic HTML**: Use appropriate heading levels (h2)
4. **Color Contrast**: Golden yellow (#FFD700) on white background meets WCAG AA
5. **Keyboard Navigation**: CTA button fully keyboard accessible

## Animation Specifications

### Counter Animation
- **Duration**: 2000ms
- **Easing**: Linear progression
- **Trigger**: Intersection Observer (50% visibility)
- **Format**: Number with locale-specific thousands separator
- **Performance**: RequestAnimationFrame for smooth 60fps

### Visual Feedback
- **Initial State**: Display "0"
- **Animation**: Count up to target number
- **End State**: Display final count with proper formatting
- **One-time**: Animation runs once per page load

## Success Metrics

1. **Engagement Metrics**
   - Increased click-through rate to `/supporters` page
   - Higher awareness of movement scale
   - Better conversion on signup forms

2. **Technical Metrics**
   - Page load time remains under 2 seconds
   - Animation runs at 60fps
   - No layout shift during animation

3. **User Experience Metrics**
   - Users understand the scale of support immediately
   - Clear connection between voices and movement size
   - Improved narrative flow on feed page

## Future Enhancements

1. **Real-time Updates**: WebSocket connection for live counter updates
2. **Growth Indicator**: Show daily/weekly growth rate
3. **Milestone Celebrations**: Special animations at round numbers
4. **Geographic Breakdown**: Show supporter distribution
5. **Social Proof**: Recent joiner notifications
6. **Gamification**: Progress bar to next milestone

## Testing Requirements

### Functional Testing
- [ ] Counter displays correct total from leads collection
- [ ] Animation triggers on scroll into view
- [ ] CTA button links to supporters page
- [ ] Number formatting works for all ranges

### Visual Testing
- [ ] Responsive design works across breakpoints
- [ ] Animation is smooth and performant
- [ ] Colors and styling match design system
- [ ] No layout shifts or jumps

### Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Animation maintains 60fps
- [ ] No memory leaks from observers
- [ ] Efficient data fetching

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-08-20 | Initial PRD for movement counter relocation | Claude Code |