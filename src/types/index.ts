/**
 * Main types index file
 * Re-exports all types for easy importing
 */

// Re-export all form types
export * from './forms';

// Re-export all API types  
export * from './api';

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Navigation Types
export interface NavigationMenuItem {
  href: string;
  label: string;
  active?: boolean;
  external?: boolean;
}

export interface NavigationMenuProps extends BaseComponentProps {
  currentPath: string;
  menuItems: NavigationMenuItem[];
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Page Counter Types
export interface PageCounterProps extends BaseComponentProps {
  apiEndpoint: string;
  initialCount?: number;
  label?: string;
  showError?: boolean;
  formatNumber?: boolean;
  updateOnMount?: boolean;
}

// Animation and Interaction Types
export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface UseIntersectionObserverReturn {
  ref: React.RefObject<Element>;
  isVisible: boolean;
  hasBeenVisible: boolean;
}

export interface UseAnimatedCounterOptions {
  target: number;
  duration?: number;
  formatNumber?: boolean;
  triggerOnIntersection?: boolean;
  easing?: (t: number) => number;
}

export interface UseAnimatedCounterReturn {
  count: number;
  ref: React.RefObject<Element>;
  isAnimating: boolean;
  restart: () => void;
}

// Scroll Effects Types
export interface ScrollEffectElement {
  selector: string;
  speed: number;
}

export interface HideOnScrollElement {
  selector: string;
  threshold: number;
}

export interface UseScrollEffectsOptions {
  parallaxElements?: ScrollEffectElement[];
  hideOnScroll?: HideOnScrollElement[];
  throttle?: number;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Theme and Styling Types
export type BrutalistColor = 'black' | 'white' | 'red' | 'gray' | 'concrete' | 'shadow';

export interface BrutalistTheme {
  colors: Record<BrutalistColor, string>;
  shadows: {
    default: string;
    heavy: string;
  };
  borders: {
    default: string;
    heavy: string;
  };
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorMessage?: string;
}

// Event Handler Types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;