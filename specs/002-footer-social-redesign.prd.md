# Footer Social Media Redesign PRD

**Version:** 1.0.0  
**Date:** January 2025  
**Component:** Footer.astro

## Executive Summary

Complete redesign of the site footer to incorporate brutalist-styled social media platform links, update contact messaging from "Submit Evidence" to "Contact Us", remove unnecessary phone number and meetings sections, and create a more impactful call-to-action for community engagement. This redesign will strengthen the site's digital presence while maintaining the established brutalist aesthetic.

## Problem Statement

### Current Issues
1. **No Social Media Presence** - Footer lacks links to social platforms, limiting reach and community building
2. **Outdated Contact Methods** - Phone number is impractical for digital activism
3. **Unnecessary Information** - Meetings section is not needed and clutters the footer
4. **Weak CTA Language** - "Submit Evidence" is too narrow; "Contact Us" is more inclusive
5. **Limited Engagement Pathways** - Users have few ways to connect with the movement

### User Pain Points
- Cannot easily share content on social platforms
- No clear way to follow the movement on social media
- Limited contact options beyond email
- Footer doesn't maximize activism potential
- Lacks modern digital engagement touchpoints

## Requirements

### Functional Requirements

#### Social Media Links
- **Platforms to Include:**
  - X (Twitter) - Primary for rapid updates
  - Facebook - Community building and events
  - Instagram - Visual documentation
  - YouTube - Video evidence and testimonials
  - LinkedIn - Professional networking and policy influence
  - TikTok - Youth engagement and viral reach
  - WhatsApp - Direct community communication
  - Telegram - Secure group messaging

#### Contact Section
- Change heading from "SUBMIT EVIDENCE" to "CONTACT US"
- Maintain email: johnsilver@swanagetraffic.org.uk
- Remove phone number section entirely
- Remove meetings section entirely

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  CONTACT US          FOLLOW THE MOVEMENT           │
│  johnsilver@         ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  swanagetraffic.     │X │ │FB│ │IG│ │YT│         │
│  org.uk              └──┘ └──┘ └──┘ └──┘         │
│                      ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│                      │LI│ │TT│ │WA│ │TG│         │
│                      └──┘ └──┘ └──┘ └──┘         │
│                                                     │
│  ─────────────────────────────────────────        │
│  © 2024 Swanage Traffic Alliance.                  │
│  Documenting democracy denied.                     │
└─────────────────────────────────────────────────────┘
```

### Technical Requirements

#### Social Icon Implementation
- Use text-based icons (no external dependencies)
- Heavy borders (4-8px solid)
- Box shadows for depth
- Hover states with brutal animations
- Accessibility labels for screen readers

#### Brutalist Design Language
- **Colors:**
  - Icons: Black background, white text default
  - Hover: Inverted colors or accent colors
  - Active: Golden yellow (#FFD700) highlight
- **Typography:**
  - Bold, uppercase platform abbreviations
  - Fixed-width for consistent grid
- **Interactions:**
  - Harsh transitions (no easing)
  - Dramatic shadow shifts on hover
  - Scale transforms for emphasis

### Design Requirements

#### Desktop Layout (>768px)
- Two-column grid
- Contact info on left (40% width)
- Social grid on right (60% width)
- 4x2 grid for social icons
- Icon size: 60x60px minimum

#### Mobile Layout (<768px)
- Single column stack
- Contact section first
- Social grid below (2x4 layout)
- Icon size: 50x50px
- Full-width touch targets

#### Accessibility
- ARIA labels for all social links
- Keyboard navigation support
- Focus states with visible outlines
- Semantic HTML structure
- Color contrast WCAG AA compliant

## Implementation Notes

### Component Structure
```astro
<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-contact">
            <h3>CONTACT US</h3>
            <a href="mailto:johnsilver@swanagetraffic.org.uk">
                johnsilver@swanagetraffic.org.uk
            </a>
        </div>
        <div class="footer-social">
            <h3>FOLLOW THE MOVEMENT</h3>
            <div class="social-grid">
                <a href="#" class="social-link social-link--x" 
                   aria-label="Follow on X">
                    <span>X</span>
                </a>
                <!-- Additional social links -->
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2024 Swanage Traffic Alliance. 
           Documenting democracy denied.</p>
    </div>
</footer>
```

### CSS Specifications
```css
.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--brutal-black);
    color: var(--brutal-white);
    border: 4px solid var(--brutal-black);
    box-shadow: 5px 5px 0 var(--brutal-shadow);
    text-decoration: none;
    font-weight: 900;
    font-size: 1.25rem;
    transition: none; /* Harsh transitions */
}

.social-link:hover {
    transform: translate(-5px, -5px);
    box-shadow: 10px 10px 0 var(--brutal-gray);
    background: var(--brutal-white);
    color: var(--brutal-black);
}

.social-link:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 var(--brutal-shadow);
    background: #FFD700;
}
```

### Social Media URLs
```javascript
const socialLinks = {
    x: 'https://x.com/swanagetraffic',
    facebook: 'https://facebook.com/swanagetraffic',
    instagram: 'https://instagram.com/swanagetraffic',
    youtube: 'https://youtube.com/@swanagetraffic',
    linkedin: 'https://linkedin.com/company/swanage-traffic-alliance',
    tiktok: 'https://tiktok.com/@swanagetraffic',
    whatsapp: 'https://wa.me/message/[PLACEHOLDER]',
    telegram: 'https://t.me/swanagetraffic'
}
```

## Animation Specifications

### Hover Animation Sequence
1. **Initial State:** Static brutal box
2. **Hover Enter:** 
   - Instant transform: translate(-5px, -5px)
   - Shadow extends to 10px
   - Color inversion
3. **Click/Active:**
   - Compress to original position
   - Shadow minimizes to 2px
   - Flash golden yellow background
4. **Hover Exit:** Instant return to initial

### Page Load Animation
- Staggered entrance for social icons
- 50ms delay between each icon
- Slide in from bottom with opacity fade
- Total animation time: 400ms

## Responsive Design

### Breakpoint Behaviors
- **1400px+**: Maximum width container, centered
- **768px-1400px**: Flexible two-column layout
- **480px-768px**: Single column, 2x4 social grid
- **<480px**: Single column, vertical social stack

### Touch Optimization
- Minimum touch target: 44x44px
- Increased padding on mobile
- Larger click areas than visual boundaries
- Swipe-friendly spacing

## Success Metrics

### Engagement Metrics
- Click-through rate on social links
- Email contact form submissions
- Social media follower growth
- Share/engagement rates from site

### Technical Metrics
- Page load speed maintained <2s
- Lighthouse accessibility score >95
- Zero layout shift on interaction
- Browser compatibility (last 2 versions)

### User Experience Metrics
- Time to find social links <3s
- Mobile tap accuracy >95%
- Screen reader navigation success
- Keyboard navigation completion

## Future Enhancements

### Phase 2 Considerations
1. **Dynamic Social Feeds**
   - Live feed integration
   - Latest post previews
   - Follower counts display

2. **Newsletter Signup**
   - Email subscription form
   - Campaign integration
   - GDPR compliance

3. **Share Functionality**
   - Page-specific share buttons
   - Custom share messages
   - Analytics tracking

4. **Community Features**
   - Discord server link
   - Community guidelines
   - Volunteer signup

5. **Localization**
   - Multi-language support
   - Regional social platforms
   - Local contact methods

### Technical Debt
- Consider icon font or SVG sprites for better performance
- Implement social meta tags for sharing
- Add structured data for organization
- Consider progressive enhancement for older browsers

## Testing Requirements

### Browser Testing
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

### Accessibility Testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Color contrast validation
- Focus management verification

### Performance Testing
- Load time analysis
- Interaction responsiveness
- Animation performance
- Network request optimization

## Risk Mitigation

### Potential Risks
1. **Social Platform Changes** - Platform rebranding/shutdown
   - Mitigation: Modular design for easy updates
2. **Spam/Abuse** - Email harvesting
   - Mitigation: Obfuscation techniques
3. **Performance Impact** - Multiple external links
   - Mitigation: Lazy loading, preconnect hints
4. **Accessibility Issues** - Icon-only navigation
   - Mitigation: Clear labels, tooltips

## Implementation Checklist

- [ ] Remove phone number section
- [ ] Remove meetings section  
- [ ] Update "SUBMIT EVIDENCE" to "CONTACT US"
- [ ] Implement social media grid layout
- [ ] Create brutal-styled social link components
- [ ] Add hover/active states
- [ ] Implement responsive breakpoints
- [ ] Add accessibility attributes
- [ ] Test keyboard navigation
- [ ] Validate color contrast
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Production deployment

## Notes

- Platform abbreviations chosen for clarity and space efficiency
- Golden yellow (#FFD700) used as accent for positive actions
- Harsh transitions reinforce brutalist aesthetic
- Email remains primary contact for evidence submission
- Social links should open in new tabs with rel="noopener"
- Consider adding utm parameters for analytics tracking
- Footer should remain sticky on mobile for easy access