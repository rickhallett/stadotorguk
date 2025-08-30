# 012 - Real-Time Feed from Database

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for transitioning the Community Voices feed page (`src/pages/feed.astro`) from a static content collection to a dynamic, real-time feed powered by the Neon database. This will ensure that all submitted stories are immediately visible, providing a live look at community engagement.

## 2. Problem Statement

The current feed page uses Astro's `getCollection('feed')` function, which pulls from static markdown files. This system is disconnected from the live `leads` data being collected in the Neon database via the sign-up form. As a result, new submissions are not automatically displayed, and the feed does not accurately reflect the latest community feedback.

## 3. Requirements

### Functional Requirements

- The feed must display stories from the `leads` table in the database.
- Only leads where `published` is `true` and the `comments` field is not empty should be displayed.
- The feed should be sorted in reverse chronological order (newest first), based on the `timestamp` field.
- Each feed item should display the user's first name, a relative timestamp (e.g., "2 hours ago"), and their story/comment.
- The page should gracefully handle a scenario where there are no stories to display, showing a message like "No stories yet. Be the first to share yours!".

### Technical Requirements

- Utilize the existing `getAllLeads` function in `src/utils/database.ts` to fetch the feed data.
- Modify `src/pages/feed.astro` to remove the dependency on `getCollection('feed')` and instead use `getAllLeads`.
- Implement a data transformation layer within `feed.astro` to format the lead data for display (e.g., calculating relative timestamps).
- The `comments` field from the database will be used as the main content for each feed item.
- The `first_name` field will be used for the username.

### Design Requirements

- The visual design of the feed items should remain consistent with the current implementation.
- The page must remain fully responsive across mobile and desktop devices.

## 4. Implementation Notes

The implementation will primarily involve changes to `src/pages/feed.astro`.

**Current Data Fetching:**
```astro
---
import { getCollection } from 'astro:content';
const feedEntries = await getCollection('feed', ({ data }) => {
    return data.published !== false;
});
---
```

**Proposed Data Fetching:**
```astro
---
import { getAllLeads, type Lead } from '../utils/database';

const allLeads = await getAllLeads();

// Filter for leads with comments and format them for the feed
const feedItems = allLeads
    .filter((lead: Lead) => lead.comments && lead.comments.trim() !== '')
    .map((lead: Lead) => {
        // ... logic to format timestamp and structure data
        return {
            username: lead.first_name,
            comment: lead.comments,
            // ... other fields
        };
    });
---
```

The existing client-side JavaScript for the "Load More" button and counter animations should be reviewed to ensure compatibility with the new data source, though it may not require changes for the initial implementation.

## 5. Success Metrics

- New stories submitted through the sign-up form appear on the feed page upon the next page load.
- The page load performance is not negatively impacted.
- The feed correctly displays data from the `leads` table.

## 6. Future Enhancements

- Implement pagination for the "Load More" button to fetch additional leads from the database on demand, rather than loading all leads at once.
- Introduce a caching layer to reduce database queries on the feed page.
- Add filtering options to the feed (e.g., by visitor type or date).
