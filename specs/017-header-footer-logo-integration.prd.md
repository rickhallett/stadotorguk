# 017: Header & Footer Logo Integration

- **Version**: 1.0
- **Date**: 2025-08-30

## 1. Executive Summary

This document outlines the requirements for integrating the Swanage Traffic Alliance (STA) logo into the website's header and footer. This change will enhance brand recognition and provide a consistent visual identity across the site.

## 2. Problem Statement

The current website design lacks a distinct visual logo, relying solely on the "STA" text abbreviation in the header. This minimalist approach, while clean, misses an opportunity to build a stronger brand identity. A logo will make the site more memorable and professional.

## 3. Requirements

### 3.1. User Requirements

- As a user, I want to see a clear logo in the header so I can easily identify the website.
- As a user, I want the logo to be visible and well-placed on both desktop and mobile devices.
- As a user, I expect the logo in the header to be a clickable link that takes me to the homepage.
- As a user, I want to see a smaller version of the logo in the footer for brand reinforcement.

### 3.2. Technical Requirements

- The logo shall be derived from the `@public/stg-logo.jpeg` image.
- The logo must be optimized for web use to ensure fast loading times.
- The header logo must be implemented in the `src/components/astro/Header.astro` component.
- The footer logo must be implemented in the `src/components/astro/Footer.astro` component.
- The logo should be responsive and adapt to different screen sizes.

### 3.3. Design Requirements

- **Header (Desktop):**
    - The logo should be displayed to the left of the "STA" text.
    - The logo should have a maximum height of 40px.
    - The logo and "STA" text should be vertically aligned.
- **Header (Mobile):**
    - The logo should be displayed on the left side of the header.
    - The "STA" text may be hidden or displayed next to the logo, depending on screen space.
- **Footer:**
    - A small, simplified version of the logo should be placed in the footer.
    - The footer logo should have a maximum height of 30px.
    - The logo should be placed in the `footer-bottom` section, next to the copyright notice.

## 4. Implementation Notes

### 4.1. Logo Creation

The `magick` CLI tool can be used to create the necessary logo assets from `@public/stg-logo.jpeg`.

```bash
# Create a transparent PNG for the header
magick public/stg-logo.jpeg -resize x40 public/sta-logo-header.png

# Create a smaller version for the footer
magick public/stg-logo.jpeg -resize x30 public/sta-logo-footer.png
```

### 4.2. Header Implementation (`src/components/astro/Header.astro`)

The existing logo div will be modified to include the `img` tag.

```html
<div class="logo">
  <a href="/">
    <img src="/sta-logo-header.png" alt="Swanage Traffic Alliance Logo" class="header-logo" />
    STA
  </a>
</div>

<style>
  .logo a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-logo {
    height: 40px;
    width: auto;
  }
</style>
```

### 4.3. Footer Implementation (`src/components/astro/Footer.astro`)

The `footer-bottom` div will be updated to include the logo.

```html
<div class="footer-bottom">
  <img src="/sta-logo-footer.png" alt="STA Logo" class="footer-logo" />
  <p>&copy; 2025 Swanage Traffic Alliance</p>
</div>

<style>
  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .footer-logo {
    height: 30px;
    width: auto;
  }
</style>
```

## 5. Responsive Design

### 5.1. Mobile Header

On screens smaller than 768px, the header layout will adjust.

```css
@media (max-width: 768px) {
  .header-content {
    flex-direction: row; /* Keep it horizontal on mobile */
    justify-content: space-between;
  }

  .logo a {
    font-size: 1.5rem; /* Adjust size */
  }
}
```

## 6. Animation Specifications

- The logo in the header should have a subtle hover effect, consistent with the existing "STA" text hover effect (e.g., `transform: scale(1.1)`).

## 7. Success Metrics

- The logo is successfully integrated into the header and footer.
- The website maintains its performance and fast load times.
- The layout is responsive and looks good on all devices.

## 8. Future Enhancements

- Animate the logo on page load.
- Create an SVG version of the logo for better scalability and smaller file size.
