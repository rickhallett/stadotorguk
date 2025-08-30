# PRD-009: React Integration for Interactive Components

**Version:** 1.0  
**Date:** 2025-08-30  
**Status:** Draft  

## Executive Summary

The Swanage Traffic Alliance website currently implements interactivity using vanilla JavaScript scattered across Astro components. This PRD outlines the migration to React components for improved maintainability, testing capabilities, and developer experience while preserving the site's brutalist design system and SSR/SSG performance.

## Problem Statement

### Current Pain Points

1. **Scattered JavaScript Logic**: Interactive functionality is implemented inline across multiple `.astro` files with no reusability
2. **Difficult Testing**: Vanilla JavaScript in `<script>` tags is hard to unit test and debug
3. **State Management Issues**: Complex form validation and API states are managed with DOM manipulation
4. **Poor Developer Experience**: No TypeScript interfaces, autocompletion, or refactoring support for interactive code
5. **Maintenance Overhead**: Similar functionality (counters, animations) is duplicated across components
6. **Limited Mobile Interactivity**: Missing mobile navigation, improved touch interactions

### Technical Debt

- Form validation logic duplicated and inconsistent
- Animation code repeated across components (counters, fade-ins)
- Error handling patterns not standardized
- No centralized state management for API calls
- Accessibility features implemented inconsistently

## Requirements

### User Requirements

**UR-001: Preserved Functionality**  
All existing interactive features must work identically after React migration:
- Sign-up form with validation and API integration
- Page counter with real-time updates
- Feed load-more functionality
- Animated number counters
- Scroll-based animations and parallax effects
- Countdown timer functionality

**UR-002: Enhanced Mobile Experience**  
- Responsive hamburger navigation menu
- Touch-optimized interactions
- Improved mobile form experience
- Smooth animations on mobile devices

**UR-003: Accessibility Compliance**  
- Maintain WCAG 2.1 AA compliance
- Proper ARIA labels and live regions
- Keyboard navigation support
- Screen reader compatibility

### Technical Requirements

**TR-001: Hybrid Architecture**  
- Maintain Astro as primary framework for SSR/SSG performance
- Use React components only for interactive functionality
- Preserve current build and deployment process
- Maintain brutalist design system integrity

**TR-002: Component Architecture**  
```
src/
├── components/
│   ├── astro/           # Static Astro components
│   └── react/           # Interactive React components
├── hooks/               # Custom React hooks
├── utils/               # Shared utilities
└── types/               # TypeScript interfaces
```

**TR-003: State Management**  
- React Context for shared application state
- Custom hooks for reusable logic patterns
- Proper error boundaries and loading states
- Optimistic UI updates where appropriate

**TR-004: Performance Requirements**  
- No increase in initial bundle size
- Lazy loading for interactive components
- Maintain current Lighthouse scores (95+ Performance)
- Preserve SSR capabilities

### Design Requirements

**DR-001: Brutalist Design Preservation**  
- All React components must use existing CSS variables
- Maintain current visual styling and animations
- Preserve box shadows, borders, and typography
- Keep existing responsive breakpoints

**DR-002: Animation Consistency**  
- Standardize animation patterns across components
- Maintain current animation timing and easing
- Preserve intersection observer behaviors
- Keep existing hover and focus states

## Implementation Notes

### Priority 1 Components (Phase 1)

#### 1. SignUpForm Component
```typescript
interface SignUpFormProps {
  apiEndpoint: string;
  confirmationDuration?: number;
}

interface FormState {
  values: {
    name: string;
    email: string;
    postcode: string;
    message: string;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSuccess: boolean;
}
```

**Current Location:** `src/pages/index.astro:144-198`  
**Migration Notes:**
- Extract form validation logic into custom hook `useFormValidation`
- Implement proper TypeScript interfaces for API responses
- Add comprehensive error handling and retry logic
- Create reusable field validation utilities

#### 2. PageCounter Component
```typescript
interface PageCounterProps {
  apiEndpoint: string;
  initialCount?: number;
  label?: string;
}
```

**Current Location:** `src/components/PageCounter.astro`  
**Migration Notes:**
- Convert to React with SSR support for initial count
- Implement error recovery and retry mechanisms
- Add prop-based customization for different counter types
- Create reusable animation hook for count updates

#### 3. NavigationMenu Component
```typescript
interface NavigationMenuProps {
  currentPath: string;
  menuItems: Array<{
    href: string;
    label: string;
    active?: boolean;
  }>;
}
```

**Current Location:** `src/components/Header.astro`  
**Migration Notes:**
- Add mobile hamburger menu functionality
- Implement proper keyboard navigation
- Add ARIA attributes for accessibility
- Create smooth mobile menu transitions

### Priority 2 Components (Phase 2)

#### 4. AnimatedCounter Hook
```typescript
interface UseAnimatedCounterOptions {
  target: number;
  duration?: number;
  formatNumber?: boolean;
  triggerOnIntersection?: boolean;
}
```

**Current Locations:** `src/pages/feed.astro:411-442`, multiple counters  
**Migration Notes:**
- Extract common counter animation logic
- Support different number formatting options
- Integrate with intersection observer
- Add accessibility announcements for screen readers

#### 5. FeedLoadMore Component
```typescript
interface FeedLoadMoreProps {
  onLoadMore: () => Promise<FeedItem[]>;
  isLoading: boolean;
  hasMore: boolean;
}
```

**Current Location:** `src/pages/feed.astro:343-391`  
**Migration Notes:**
- Convert to proper pagination component
- Add infinite scroll option
- Implement proper loading states
- Add error handling for failed requests

#### 6. ScrollEffects Hook
```typescript
interface UseScrollEffectsOptions {
  parallaxElements?: Array<{
    selector: string;
    speed: number;
  }>;
  hideOnScroll?: Array<{
    selector: string;
    threshold: number;
  }>;
}
```

**Current Location:** `src/pages/index.astro:665-686`  
**Migration Notes:**
- Centralize scroll-based animations
- Add performance throttling
- Support multiple parallax speeds
- Implement will-change CSS optimization

### Custom Hooks Architecture

#### useIntersectionObserver
```typescript
function useIntersectionObserver(
  options?: IntersectionObserverInit
): {
  ref: RefObject<Element>;
  isVisible: boolean;
  hasBeenVisible: boolean;
}
```

#### useApiCall
```typescript
function useApiCall<T>(
  endpoint: string,
  options?: RequestInit
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}
```

#### useFormValidation
```typescript
function useFormValidation<T>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
): {
  values: T;
  errors: Record<keyof T, string>;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (callback: (values: T) => void) => void;
}
```

## Responsive Design Considerations

### Mobile Navigation Enhancement
- **Hamburger Menu**: Slide-in navigation for mobile devices
- **Touch Gestures**: Swipe support for timeline and feed navigation
- **Improved Forms**: Better mobile form field focus and validation display
- **Touch Targets**: Ensure all interactive elements meet 44px minimum size

### Desktop Enhancements
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Hover States**: Enhanced hover feedback for better UX
- **Focus Management**: Proper focus handling for modal dialogs and forms

## Accessibility Considerations

### WCAG 2.1 AA Compliance
- **ARIA Labels**: Proper labeling for all interactive elements
- **Live Regions**: Announcements for dynamic content updates
- **Focus Management**: Logical tab order and focus trapping
- **Color Contrast**: Maintain current high-contrast brutalist design
- **Screen Reader**: Test with VoiceOver, NVDA, and JAWS

### Implementation Details
- Add `role` attributes for custom interactive elements
- Implement `aria-live` regions for counter updates
- Ensure form validation errors are announced
- Add `aria-expanded` for mobile menu state
- Implement proper heading hierarchy

## Animation Specifications

### Existing Animations to Preserve
1. **Hero Grid Parallax**: `translateY(${scrolled * 0.5}px)`
2. **Counter Pulse**: 0.6s ease animation on update
3. **Form Confirmation**: Scale and rotate animation
4. **Fade-in Elements**: 0.6s ease-out with staggered delays
5. **Hover Transforms**: translate(-4px, -4px) with shadow changes

### New Animation Patterns
1. **Mobile Menu**: Slide-in/out with backdrop fade
2. **Loading States**: Subtle pulse animations
3. **Error States**: Shake animation for validation errors
4. **Success States**: Check mark animation for confirmations

### Performance Optimization
- Use `transform` and `opacity` for GPU acceleration
- Implement `will-change` CSS property for active animations
- Use `requestAnimationFrame` for smooth counter animations
- Add `prefers-reduced-motion` support

## Testing Strategy

### Unit Testing
- **Jest + React Testing Library** for component testing
- **Custom Hooks Testing** using `@testing-library/react-hooks`
- **Accessibility Testing** with `jest-axe`
- **API Mocking** with Mock Service Worker (MSW)

### Integration Testing
- **Playwright** for end-to-end form submission flows
- **Cross-browser** testing for animation compatibility
- **Mobile Device** testing for touch interactions
- **Screen Reader** testing for accessibility compliance

### Test Coverage Requirements
- **Minimum 80%** code coverage for React components
- **100% coverage** for form validation logic
- **Critical path testing** for signup and counter flows
- **Error scenario testing** for API failures

## Migration Strategy

### Phase 1: Core Components (Week 1-2)
1. Set up React integration in Astro project
2. Migrate SignUpForm component with full testing
3. Convert PageCounter to React with SSR support
4. Update NavigationMenu with mobile functionality
5. Deploy to staging environment for testing

### Phase 2: Animation & Interaction (Week 3-4)
1. Create custom hooks for reusable functionality
2. Migrate remaining interactive components
3. Implement comprehensive testing suite
4. Performance optimization and accessibility audit
5. Deploy to production with feature flags

### Phase 3: Enhancement & Polish (Week 5-6)
1. Add advanced features (infinite scroll, search, filters)
2. Mobile UX improvements and touch gestures
3. Analytics integration for interaction tracking
4. Documentation and developer guidelines
5. Performance monitoring and optimization

## Success Metrics

### Performance Metrics
- **Lighthouse Performance Score**: Maintain 95+ 
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

### User Experience Metrics
- **Form Conversion Rate**: Maintain or improve current rate
- **Mobile Navigation Usage**: Track hamburger menu interactions
- **Error Rate Reduction**: Decrease form validation errors by 30%
- **Accessibility Score**: WAVE tool score improvement
- **User Session Duration**: Monitor for UX improvements

### Developer Experience Metrics
- **Test Coverage**: Achieve 80%+ coverage
- **Build Time**: Maintain current build performance
- **Component Reusability**: 70%+ of interactive code in reusable components
- **TypeScript Coverage**: 100% for all React components

## Risk Analysis

### Technical Risks
- **Bundle Size Increase**: React components may increase JavaScript payload
  - *Mitigation*: Lazy loading, code splitting, tree shaking
- **SSR Compatibility**: React hydration issues with Astro SSR
  - *Mitigation*: Use Astro's React integration, test thoroughly
- **Animation Performance**: React re-renders may affect smooth animations
  - *Mitigation*: Use React.memo, useMemo, useCallback optimizations

### Timeline Risks
- **Complexity Underestimation**: Interactive components more complex than anticipated
  - *Mitigation*: Phased approach, continuous testing
- **Design System Conflicts**: React styling conflicts with existing CSS
  - *Mitigation*: CSS-in-JS solution or careful class management

### User Experience Risks
- **Functionality Regression**: Breaking existing user workflows
  - *Mitigation*: Comprehensive testing, feature flags, gradual rollout
- **Accessibility Degradation**: React components less accessible than current implementation
  - *Mitigation*: Accessibility-first development, regular audits

## Future Enhancements

### Advanced Interactivity (Phase 4+)
- **Real-time Feed Updates**: WebSocket integration for live updates
- **Advanced Filtering**: Multi-faceted search and filter components
- **Data Visualization**: Interactive charts for traffic data
- **User Accounts**: Login/logout functionality with React Context
- **Offline Support**: Service worker integration for offline form submissions

### Performance Optimizations
- **React Suspense**: For better loading state management
- **React Server Components**: When Astro adds support
- **Edge Computing**: Move counter API to edge functions
- **Caching Strategy**: Implement advanced caching for API responses

### Analytics & Tracking
- **Interaction Analytics**: Track button clicks, form abandonment
- **Performance Monitoring**: Real user monitoring for React components
- **A/B Testing**: Component-level testing for conversion optimization
- **Error Tracking**: Sentry integration for React error monitoring

---

## Approval & Sign-off

**Technical Lead:** _Pending Review_  
**Design Lead:** _Pending Review_  
**Project Manager:** _Pending Review_  
**Accessibility Specialist:** _Pending Review_

---

*This PRD serves as the technical specification for migrating the Swanage Traffic Alliance website's interactive components to React while maintaining performance, accessibility, and design system integrity.*