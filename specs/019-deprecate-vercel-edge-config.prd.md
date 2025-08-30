# PRD 019: Deprecate Vercel Edge Config

- **Version:** 1.0
- **Date:** 2025-08-30

## 1. Executive Summary

This document outlines the plan to deprecate the use of Vercel Edge Config for the page view counter. The existing implementation uses Neon Postgres as the primary data store and Vercel Edge Config as a fallback and for data synchronization. This PRD proposes to remove the Vercel Edge Config dependency and rely solely on Neon Postgres for all page view counting operations.

## 2. Problem Statement

The current page counter API (`/api/counter`) has a dependency on Vercel Edge Config. This introduces several issues:

- **Increased Complexity:** The code contains logic for a fallback mechanism and data synchronization, making it harder to maintain and understand.
- **Vendor Lock-in:** The project has a dependency on a Vercel-specific feature, which could complicate future migrations to other platforms.
- **Potential for Data Inconsistency:** Syncing data between two different data stores can lead to discrepancies.
- **Redundancy:** The Neon Postgres database is a reliable and robust solution, making the fallback mechanism unnecessary.

By removing the Vercel Edge Config dependency, we can simplify the codebase, remove a vendor-specific dependency, and improve the overall reliability of the page view counter.

## 3. Requirements

### Functional Requirements

- The page view counter must continue to accurately record and display the number of page views.
- The `/api/counter` GET endpoint should return the current page view count.
- The `/api/counter` POST endpoint should increment the page view count.

### Technical Requirements

- Remove the `@vercel/edge-config` package from the project's dependencies.
- Remove all code related to Vercel Edge Config from `src/pages/api/counter.ts`.
- The `updateEdgeConfig` function in `src/pages/api/counter.ts` must be removed.
- The fallback logic in the `GET` and `POST` request handlers in `src/pages/api/counter.ts` must be removed.
- The "fire-and-forget" synchronization with Vercel Edge Config must be removed.
- All page view count data must be read from and written to the Neon Postgres database.

## 4. Implementation Notes

The primary file to be modified is `src/pages/api/counter.ts`. The logic that handles fallbacks and synchronization with Vercel Edge Config should be removed.

### Code Examples

#### Current `POST` handler (simplified)

```typescript
// src/pages/api/counter.ts (before)

// ... imports including @vercel/edge-config

export const POST: APIRoute = async ({ request }) => {
  try {
    // ...
    let newCount: number;
    try {
      newCount = await incrementPageCount();
    } catch (dbError) {
      console.error("Database increment failed, trying Edge Config fallback:", dbError);
      
      // Fallback: Read current count and increment in Edge Config
      const currentCount = Number((await get("page_views")) || 0);
      newCount = currentCount + 1;
      await updateEdgeConfig("page_views", newCount);
    }

    // Optional: Keep Edge Config in sync (fire-and-forget)
    try {
      await updateEdgeConfig("page_views", newCount);
    } catch (edgeError) {
      console.warn("Edge Config sync failed (non-critical):", edgeError);
    }
    // ...
  } catch (error) {
    // ...
  }
};
```

#### Proposed `POST` handler (simplified)

```typescript
// src/pages/api/counter.ts (after)

// ... imports (no @vercel/edge-config)

export const POST: APIRoute = async ({ request }) => {
  try {
    // ...
    const newCount = await incrementPageCount();
    
    return new Response(
      JSON.stringify({
        count: newCount,
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    // ...
  } catch (error) {
    // ...
  }
};
```

The `GET` handler should be simplified in a similar manner.

### Dependency Removal

The `@vercel/edge-config` package should be removed from the project's dependencies.

```bash
bun uninstall @vercel/edge-config
```

This will update `package.json` and `bun.lockb`.

## 5. Success Metrics

- The page counter API (`/api/counter`) continues to function as expected.
- The `@vercel/edge-config` package is no longer listed in `package.json` or `bun.lockb`.
- The application no longer makes API calls to Vercel Edge Config.
- The codebase is simplified and easier to maintain.
