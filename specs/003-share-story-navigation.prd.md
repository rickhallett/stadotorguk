# Share Your Story Navigation PRD

**Version:** 1.0.0  
**Date:** January 2025  
**Component:** Feed Page "Add Your Voice" Section

## Executive Summary

Update the "Share Your Story" button in the Feed page's "Add Your Voice" section to navigate to the homepage and smoothly scroll to the contact form. This creates a seamless user journey from reading community stories to contributing their own, while maintaining the brutalist design aesthetic and improving conversion rates for community engagement.

## Problem Statement

### Current Issues
1. **Dead-End Navigation** - Current button links to homepage root without specific destination
2. **Lost User Context** - Users land at top of homepage, must manually find form
3. **Poor Conversion Flow** - Multiple steps between intent and action reduces submissions
4. **Missing Anchor Point** - Homepage form lacks unique identifier for direct navigation
5. **No Scroll Behavior** - Jarring page transition without smooth user guidance

### User Pain Points
- Click "Share Your Story" but don't know where to go next
- Have to scroll through entire homepage to find form
- Lose motivation between clicking CTA and finding form
- No visual connection between reading stories and sharing their own
- Confusion about whether button worked correctly

## Requirements

### Functional Requirements

#### Navigation Flow
1. User clicks "Share Your Story" button on Feed page
2. Browser navigates to homepage (`/`)
3. Page automatically scrolls to form section
4. Form section becomes visible with smooth scroll animation
5. Optional: First form field receives focus for immediate input

#### Technical Implementation
- Add unique ID anchor to form section: `#share-your-story`
- Update button href to: `/#share-your-story`
- Implement smooth scroll behavior on page load
- Handle both direct navigation and same-page scrolling
- Ensure accessibility with proper focus management

### User Flow Diagram
```
┌─────────────────┐
│   FEED PAGE     │
│                 │
│ [Add Your Voice]│
│                 │
│ "Share Your     │
│  Story" Button  │
└────────┬────────┘
         │ Click
         ▼
┌─────────────────┐
│   HOMEPAGE      │
│                 │
│  Hero Section   │
│       ▼         │
│  Auto-scroll    │
│       ▼         │
│ ┌─────────────┐ │
│ │Contact Form │ │
│ │#share-your- │ │
│ │   story     │ │
│ └─────────────┘ │
└─────────────────┘
```

### Technical Requirements

#### Anchor Implementation
```astro
<!-- Homepage Form Section -->
<BrutalSection id="share-your-story">
    <h2 class="brutal-headline">Join the alliance</h2>
    <div class="action-form">
        <form id="contactForm">
            <!-- Form fields -->
        </form>
    </div>
</BrutalSection>
```

#### Button Update
```astro
<!-- Feed Page CTA -->
<a href="/#share-your-story" 
   class="submit-btn share-story-link" 
   style="display: inline-block; text-decoration: none;">
    SHARE YOUR STORY
</a>
```

#### Smooth Scroll JavaScript
```javascript
// On homepage load, check for hash
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#share-your-story') {
        setTimeout(() => {
            const element = document.getElementById('share-your-story');
            if (element) {
                // Smooth scroll with offset for header
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Optional: Focus first input
                setTimeout(() => {
                    const firstInput = element.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 1000);
            }
        }, 100); // Small delay for page render
    }
});
```

### Design Requirements

#### Visual Feedback
- Button hover state should indicate external navigation
- Add subtle arrow icon or indicator
- Maintain brutalist aesthetic with harsh transitions

#### Scroll Animation
- Duration: 800-1000ms for smooth but quick transition
- Easing: Linear or subtle ease-out (no bounce)
- Offset: Account for fixed header if present
- Visual indicator: Highlight form section on arrival

#### Mobile Considerations
- Ensure smooth scroll works on iOS Safari
- Test with virtual keyboard appearance
- Verify scroll position on different screen sizes

## Implementation Notes

### Step-by-Step Implementation

1. **Add Anchor to Homepage Form**
   - Edit `src/pages/index.astro`
   - Add `id="share-your-story"` to form section container
   - Ensure ID is unique on page

2. **Update Feed Page Button**
   - Edit `src/pages/feed.astro`
   - Change href from `/` to `/#share-your-story`
   - Add aria-label for clarity

3. **Implement Scroll Behavior**
   - Add JavaScript to homepage
   - Handle hash detection on load
   - Implement smooth scroll with offset
   - Add focus management

4. **Test Cross-Browser**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers
   - With/without JavaScript enabled

### Alternative Implementations

#### Option A: Client-Side Router (if using)
```javascript
// If using client-side routing
router.push('/', { hash: 'share-your-story' });
```

#### Option B: Server-Side Redirect
```javascript
// Server redirect with hash
return redirect('/#share-your-story');
```

#### Option C: Progressive Enhancement
```html
<!-- Works without JavaScript -->
<a href="/#share-your-story">Share Your Story</a>

<!-- Enhanced with JavaScript -->
<script>
  // Add smooth scroll only if JS enabled
  document.documentElement.style.scrollBehavior = 'smooth';
</script>
```

## Responsive Design

### Desktop Behavior
- Smooth scroll shows full journey from top to form
- Form section centered in viewport after scroll
- Optional: Parallax effect during scroll

### Mobile Behavior
- Instant scroll to reduce motion sickness
- Account for mobile browser chrome changes
- Ensure form is fully visible above keyboard
- Consider reduced motion preferences

### Tablet Behavior
- Same as desktop with adjusted offsets
- Test landscape/portrait orientation changes
- Verify with on-screen keyboards

## Accessibility Considerations

### WCAG 2.1 Compliance
- **Focus Management**: Move focus to form or first input
- **Skip Links**: Ensure compatibility with skip navigation
- **Screen Readers**: Announce navigation and destination
- **Keyboard Navigation**: Full keyboard support for all interactions

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto !important;
    }
}
```

### ARIA Attributes
```html
<a href="/#share-your-story" 
   aria-label="Navigate to homepage contact form to share your story">
    SHARE YOUR STORY
</a>

<section id="share-your-story" 
         role="region" 
         aria-label="Contact form">
    <!-- Form content -->
</section>
```

## Animation Specifications

### Scroll Animation
- **Duration**: 800ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Offset**: -100px from top for header clearance
- **Fallback**: Instant scroll if smooth scroll unsupported

### Visual Indicators
```css
/* Highlight form on arrival */
#share-your-story:target {
    animation: highlight-brutal 2s ease-out;
}

@keyframes highlight-brutal {
    0% {
        box-shadow: 0 0 0 0 var(--brutal-gray);
    }
    50% {
        box-shadow: 0 0 0 20px var(--brutal-gray);
    }
    100% {
        box-shadow: 15px 15px 0 var(--brutal-shadow);
    }
}
```

## Success Metrics

### User Engagement
- **Conversion Rate**: Click-to-submission ratio increase by 25%
- **Time to Form**: Reduce from avg 15s to 2s
- **Bounce Rate**: Decrease homepage bounce from feed by 20%
- **Form Starts**: Increase form field interactions by 30%

### Technical Performance
- **Scroll Duration**: Complete in <1 second
- **JavaScript Size**: <2KB additional code
- **Browser Support**: 99%+ coverage
- **Accessibility Score**: Maintain 100% score

### User Experience
- **Task Completion**: 95% users successfully find form
- **Error Rate**: <5% navigation failures
- **Satisfaction**: Positive feedback on flow
- **Mobile Success**: Equal conversion on mobile/desktop

## Future Enhancements

### Phase 2 Features
1. **Pre-fill Context**
   - Pass context from feed to form
   - Pre-select "story type" based on origin
   - Show relevant examples

2. **Progressive Form**
   - Start with single field
   - Expand as user engages
   - Reduce initial friction

3. **Social Proof**
   - Show recent submissions count
   - Display success stories
   - Add testimonial carousel

4. **Analytics Integration**
   - Track scroll completion
   - Monitor drop-off points
   - A/B test button text

### Technical Improvements
- Implement view transitions API when available
- Add loading states for slow connections
- Cache form state in localStorage
- Implement form autosave

## Testing Requirements

### Functional Tests
- [ ] Button navigates to homepage
- [ ] Page scrolls to form section
- [ ] Form is visible after scroll
- [ ] Works without JavaScript
- [ ] Back button behavior correct

### Cross-Browser Tests
- [ ] Chrome (Windows, Mac, Android)
- [ ] Safari (Mac, iOS)
- [ ] Firefox (Windows, Mac)
- [ ] Edge (Windows)
- [ ] Samsung Internet

### Performance Tests
- [ ] Scroll completes in <1s
- [ ] No layout shift during scroll
- [ ] Smooth on low-end devices
- [ ] Works on slow connections

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus management proper
- [ ] Reduced motion respected

## Risk Mitigation

### Potential Issues

1. **Deep Linking Conflicts**
   - Risk: Other anchors on homepage interfere
   - Mitigation: Unique, specific ID naming

2. **JavaScript Disabled**
   - Risk: No smooth scroll
   - Mitigation: Native anchor still works

3. **Mobile Browser Quirks**
   - Risk: iOS Safari scroll issues
   - Mitigation: Fallback to instant scroll

4. **Performance Impact**
   - Risk: Janky scroll on slow devices
   - Mitigation: Detect and disable animation

## Implementation Checklist

- [ ] Add `id="share-your-story"` to homepage form section
- [ ] Update feed page button href to `/#share-your-story`
- [ ] Implement smooth scroll JavaScript on homepage
- [ ] Add focus management for accessibility
- [ ] Test smooth scroll behavior across browsers
- [ ] Add reduced motion media query support
- [ ] Update button aria-label for clarity
- [ ] Test mobile keyboard interaction
- [ ] Add visual feedback on form arrival
- [ ] Document behavior in codebase
- [ ] Update any existing navigation documentation
- [ ] Performance test scroll animation
- [ ] Accessibility audit with screen readers
- [ ] User test the complete flow
- [ ] Deploy and monitor metrics

## Code Examples

### Complete Implementation
```astro
<!-- src/pages/feed.astro -->
<BrutalSection background="black">
    <h2 class="brutal-subhead" style="color: #FFD700;">
        ADD YOUR VOICE
    </h2>
    <p style="font-size: 1.25rem; margin-bottom: 2rem;">
        Your experience matters. Document the crisis. Join the resistance.
    </p>
    <a href="/#share-your-story" 
       class="submit-btn" 
       style="display: inline-block; text-decoration: none;"
       aria-label="Navigate to contact form to share your story">
        SHARE YOUR STORY
    </a>
</BrutalSection>
```

```astro
<!-- src/pages/index.astro -->
<BrutalSection id="share-your-story">
    <h2 class="brutal-headline">Join the alliance</h2>
    <div class="action-form">
        <form id="contactForm">
            <!-- Form fields -->
        </form>
    </div>
</BrutalSection>

<script>
    // Handle smooth scroll to form
    function scrollToForm() {
        if (window.location.hash === '#share-your-story') {
            setTimeout(() => {
                const element = document.getElementById('share-your-story');
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Focus management
                    setTimeout(() => {
                        const firstInput = element.querySelector('input[type="text"], input[type="email"]');
                        if (firstInput) {
                            firstInput.focus();
                            firstInput.scrollIntoView({ block: 'center' });
                        }
                    }, 1000);
                }
            }, 100);
        }
    }
    
    // Run on load and hash change
    window.addEventListener('DOMContentLoaded', scrollToForm);
    window.addEventListener('hashchange', scrollToForm);
</script>
```

## Notes

- Consider adding URL parameter to track source (e.g., `?source=feed`)
- Monitor form submission rates after implementation
- Consider A/B testing button text variations
- May need to adjust scroll offset based on header height
- Test with browser extensions that modify scroll behavior
- Consider implementing breadcrumb or back-to-feed link
- Document the navigation flow in user onboarding