# 011 - Dynamic Active Member Count

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for updating the "Active Members" count on the homepage to be dynamic, reflecting the total number of leads from the database. This change will ensure that the displayed number is always accurate and up-to-date.

## 2. Problem Statement

The "Active Members" count on the homepage (`src/pages/index.astro`) is currently hardcoded to "623". This static value does not reflect the actual number of members who have signed up, leading to inaccurate representation of the alliance's growth. The `feed.astro` page already implements a dynamic counter, and this functionality needs to be extended to the homepage.

## 3. Requirements

### Functional Requirements

- The "Active Members" count on the homepage must display the total number of leads from the `leads` table in the database.
- The count should be fetched server-side when the page is rendered.
- The count should be updated automatically as new leads are added to the database.

### Technical Requirements

- Utilize the existing `getLeadCount` function in `src/utils/database.ts` to fetch the total number of leads.
- Modify `src/pages/index.astro` to call `getLeadCount` and pass the result to the `DataBlock` component.
- Ensure that the database connection is handled correctly and does not introduce performance issues.

### Design Requirements

- The visual appearance of the "Active Members" `DataBlock` component should remain unchanged.

## 4. Implementation Notes

The implementation should follow the pattern used in `src/pages/feed.astro` for fetching data.

**File to be modified:** `src/pages/index.astro`

**Current Implementation:**

```astro
<DataBlock label="ACTIVE MEMBERS" stat="623" description="" />
```

**Proposed Implementation:**

```astro
---
import { getLeadCount } from '../utils/database';

const leadCount = await getLeadCount();
---
...
<DataBlock label="ACTIVE MEMBERS" stat={leadCount.toString()} description="" />
...
```

This will involve adding a script section to `src/pages/index.astro` to fetch the data and then passing it to the `stat` prop of the `DataBlock` component. The `getLeadCount` function from `src/utils/database.ts` should be used for this purpose.

## 5. Success Metrics

- The "Active Members" count on the homepage accurately reflects the total number of records in the `leads` table where `published` is true.
- The page continues to load without any noticeable performance degradation.

## 6. Future Enhancements

- Implement caching for the lead count to reduce database queries for high-traffic scenarios.
- Add a historical graph showing the growth of members over time.
