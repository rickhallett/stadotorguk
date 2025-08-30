# 014 - Website Copy and Visual Updates

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines a series of updates to the website's copy and visuals based on a recent stakeholder meeting. The changes are intended to refine the website's messaging to be less combative, improve visual content on the homepage, and add a professional branding element with a site logo.

## 2. Problem Statement

The current website contains some placeholder text and lacks visual elements that could make it more engaging. Some of the copy is considered too "combative" and needs to be revised to better align with the project's current communication strategy. Additionally, the absence of a site logo detracts from the brand's identity and professionalism.

## 3. Requirements

### Functional Requirements

-   **Homepage - Hero Section:**
    -   The text "We are all affected" in the hero section should be replaced with a static image.
-   **Homepage - News/Updates Section:**
    -   The copy in the news/updates section needs to be revised. The theme should shift from "follow the evidence trail" to "The big decisions being made" and "The push for transparency."
    -   Content deemed overly "controversial" or "combative," such as "Standard Order 1c used to silence critics," should be removed.
-   **Footer - Contact Information:**
    -   The name "John Silver" in the contact section of the footer should be replaced with a more generic term like "Admin" or simply removed to leave a general contact point.
-   **Header - Logo:**
    -   A website logo should be added to the header.

### Technical Requirements

-   The Swanage roadmap image should be optimized for the web to ensure it does not negatively impact page load times.
-   The logo should be implemented in a way that is responsive and displays correctly on both desktop and mobile devices.
-   The copy changes will require identifying the correct content files or components to update.

### Design Requirements

-   **Swanage Roadmap Image:**
    -   The image should be a visually appealing roadmap of Swanage. An "outline roadmap" style was suggested.
    -   It should be integrated into the design smoothly, possibly using fades or color overlays to avoid looking amateurish. Natural satellite map colors were suggested as a possibility that might fit the existing color scheme.
-   **Logo:**
    -   The logo should be placed in the header.
    -   **Desktop:** On the left side of the header.
    -   **Mobile:** In a suitable position in the header for smaller screens.

## 4. Implementation Notes

-   **Homepage Text Replacement:**
    -   Locate the "We are all affected" text in `src/pages/index.astro` and replace it with an `<img>` tag or an Astro component for the roadmap.
-   **News Section Copy:**
    -   The exact copy for the news section is yet to be provided. The initial implementation may need to use placeholder text that reflects the new, less combative theme.
-   **Footer Update:**
    -   The footer component, likely located in `src/components/astro/Footer.astro`, will need to be edited to change the contact name.
-   **Logo:**
    -   A placeholder logo may be required if the final asset is not available. The header component, likely in `src/components/astro/Header.astro`, will need to be modified to include the logo.

## 5. Success Metrics

-   All specified copy and visual changes are successfully implemented on the live site.
-   The new image and logo are responsive and display well across all common screen sizes.
-   The website's overall aesthetic is improved and feels more professional.

## 6. Future Enhancements

-   Once the final copy for the news section is available, it should be implemented.
-   The live sign-up feed, mentioned in the transcript, could be considered as a future addition to the homepage to increase the sense of activity and engagement.
