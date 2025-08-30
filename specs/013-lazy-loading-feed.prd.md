# 013 - Lazy Loading for Feed Page

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for implementing a "Load More" functionality on the Community Voices feed page (`src/pages/feed.astro`). This feature will use lazy loading to fetch leads from the database in batches, significantly improving the initial page load time and reducing the initial data payload.

## 2. Problem Statement

The current feed page fetches all leads from the database at once using `getAllLeads`. As the number of leads increases, this approach will lead to slower initial page loads and a larger-than-necessary initial data transfer. The existing "LOAD MORE VOICES" button is a non-functional placeholder.

## 3. Requirements

### Functional Requirements

- The feed page should initially load a limited number of the most recent leads (e.g., 10).
- When a user clicks the "LOAD MORE VOICES" button, the next batch of leads should be fetched from the database and appended to the existing feed.
- The "LOAD MORE VOICES" button should be hidden or disabled when there are no more leads to load.
- The loading process should provide visual feedback to the user (e.g., a "LOADING..." message on the button).

### Technical Requirements

- Create a new API endpoint (e.g., `/api/get-leads`) that accepts `limit` and `offset` parameters for pagination.
- Create a new database function, `getLeads`, in `src/utils/database.ts` that accepts `limit` and `offset` parameters to fetch a subset of leads.
- Modify `src/pages/feed.astro` to fetch only the initial batch of leads on the server.
- Implement client-side JavaScript in `feed.astro` to handle the "Load More" button clicks, make API requests to the new endpoint, and dynamically render the new feed items.
- The client-side script should keep track of the current offset to fetch the correct next batch of leads.

### Design Requirements

- The visual design of the feed and the "Load More" button should remain consistent with the current implementation.
- A smooth animation should be used when new feed items are added to the page.

## 4. Implementation Notes

### Database Function (`src/utils/database.ts`)

A new function `getLeads(limit: number, offset: number)` should be created:
```typescript
export async function getLeads(limit: number, offset: number): Promise<Lead[]> {
  try {
    const result = await sql`
      SELECT * FROM leads 
      WHERE published = true AND comments IS NOT NULL AND comments != ''
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return result as Lead[];
  } catch (error) {
    console.error('Failed to get leads:', error);
    throw error;
  }
}
```

### API Endpoint (`src/pages/api/get-leads.ts`)

A new API route will handle fetching paginated leads:
```typescript
import type { APIRoute } from "astro";
import { getLeads } from "../../utils/database";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  const leads = await getLeads(limit, offset);

  return new Response(JSON.stringify(leads), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

### Client-Side Script (`src/pages/feed.astro`)

The existing script will be replaced with logic to handle API calls:
```javascript
<script>
  let offset = 10; // Initial offset after the first batch
  const limit = 10;

  document.getElementById('loadMore')?.addEventListener('click', async function() {
    const button = this as HTMLButtonElement;
    button.disabled = true;
    button.textContent = 'LOADING...';

    const response = await fetch(`/api/get-leads?limit=${limit}&offset=${offset}`);
    const newLeads = await response.json();

    // ... logic to render newLeads and append to the feed container ...

    offset += limit;

    if (newLeads.length < limit) {
      button.style.display = 'none'; // Hide button if no more leads
    } else {
      button.disabled = false;
      button.textContent = 'LOAD MORE VOICES';
    }
  });
</script>
```

## 5. Success Metrics

- The initial page load time of the feed page is significantly reduced.
- The "Load More" functionality correctly fetches and displays the next set of leads.
- The user experience is smooth and intuitive.

## 6. Future Enhancements

- Implement infinite scrolling as an alternative to the "Load More" button.
- Add client-side caching for the fetched leads.
