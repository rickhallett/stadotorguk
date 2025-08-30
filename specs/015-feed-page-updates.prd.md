# 015 - Feed Page Content and Style Updates

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for updating the content and styling of the Community Voices feed page (`src/pages/feed.astro`). The changes include removing the "Days Until Vote" countdown, renaming the "Latest Reports" section to "Latest Members," removing a descriptive paragraph, and ensuring the "Load More" button is visible by default.

## 2. Problem Statement

The feed page contains several elements that are either no longer relevant or could be improved for clarity and user experience:
- The "Days Until Vote" countdown is a static element that is not relevant to the page's purpose.
- The title "Latest Reports" is not as engaging as "Latest Members."
- The paragraph under "Latest Reports" is verbose and unnecessary.
- The "Load More" button is not visible by default, which may confuse users.

## 3. Requirements

### Functional Requirements

- The "Days Until Vote" countdown block must be completely removed from the page.
- The title of the feed section must be changed from "LATEST REPORTS" to "LATEST MEMBERS."
- The paragraph "Every story the Town Council ignored..." must be removed.
- The "Load More" button must be visible on initial page load, provided there are more leads to fetch.

### Technical Requirements

- Modify `src/pages/feed.astro` to remove the HTML and associated styles for the "Days Until Vote" countdown.
- Update the `title` prop of the `BrutalSection` component for the feed section.
- Remove the `<p>` tag containing the unnecessary text.
- Ensure the client-side script correctly manages the visibility of the "Load More" button, making it visible if the initial number of leads is equal to the limit.

### Design Requirements

- The layout should adjust smoothly after the removal of the countdown block.
- All other styling should remain consistent.

## 4. Implementation Notes

### `src/pages/feed.astro`

**Remove Countdown Block:**
The entire `countdown-alert` div and its contents should be deleted.

```html
<!-- REMOVE THIS BLOCK -->
<div class="countdown-alert" role="timer" aria-live="polite" aria-label="Countdown to council vote">
    <div class="countdown-number" id="daysUntilVote" aria-describedby="countdown-description">--</div>
    <div class="countdown-label" id="countdown-description">DAYS UNTIL SEPTEMBER 15 VOTE</div>
</div>
```

**Update Section Title:**
Change the `title` prop of the `BrutalSection` component.

```astro
<!-- FROM -->
<BrutalSection title="LATEST REPORTS">

<!-- TO -->
<BrutalSection title="LATEST MEMBERS">
```

**Remove Paragraph:**
Delete the paragraph following the section title.

```html
<!-- REMOVE THIS PARAGRAPH -->
<p style="margin-bottom: 2rem; font-size: 1.125rem;">
    Every story the Town Council ignored. Every concern dismissed under Standing Order 1c. 
    We're building the evidence trail for judicial review.
</p>
```

**Update "Load More" Button Visibility:**
The client-side script should be updated to ensure the button is visible if there are more items to load. A simple way is to check if the initial `displayItems` length is less than the `limit`.

```astro
---
const limit = 10;
const initialLeads = await getLeads(limit, 0);
const displayItems = ...;
const showLoadMore = displayItems.length >= limit;
---

...

<div class="load-more-container">
    {showLoadMore && (
        <button class="submit-btn" id="loadMore">
            LOAD MORE VOICES
        </button>
    )}
</div>
```

## 5. Success Metrics

- The specified elements are removed from the feed page.
- The section title is updated.
- The "Load More" button is visible when appropriate.
- The page remains visually consistent and functional.
