# 018 - Deprecate Decap CMS Collections

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for deprecating the "Community Feed" and "Campaign Supporters" (leads) collections from Decap CMS and the Astro content collection. Since the website now uses a Neon database as the single source of truth for this data, these file-based collections are obsolete and should be removed to avoid confusion and data inconsistency.

## 2. Problem Statement

The `feed` and `leads` content collections still exist in the Decap CMS configuration (`public/admin/config.yml`) and the Astro content collection configuration (`src/content/config.ts`). The corresponding markdown files also still exist in `src/content/feed` and `src/content/leads`. This creates several problems:
- **Data Redundancy:** The same data is stored in both the database and the git repository.
- **Source of Truth Confusion:** It's unclear to developers and content managers which data source is authoritative.
- **Unnecessary Maintenance:** The file-based collections require maintenance and can cause conflicts.
- **Security Risk:** Sensitive lead data is stored in plain text in the repository.

## 3. Requirements

### Functional Requirements

- The "Community Feed" and "Campaign Supporters" collections must be removed from the Decap CMS interface.
- The website must continue to function correctly, pulling all feed and lead data from the database.

### Technical Requirements

- The `feed` and `leads` collection definitions must be removed from `public/admin/config.yml`.
- The `feedCollection` and `leadsCollection` definitions and exports must be removed from `src/content/config.ts`.
- The `src/content/feed` directory and all its contents must be deleted.
- The `src/content/leads` directory and all its contents must be deleted.

## 4. Implementation Notes

### Decap CMS Configuration (`public/admin/config.yml`)

The `feed` and `leads` collection blocks should be deleted.

```yaml
# REMOVE THIS BLOCK
  # Community Feed Collection
  - name: "feed"
    label: "Community Feed"
    ...

# REMOVE THIS BLOCK
  # Campaign Supporters/Leads Collection
  - name: "leads"
    label: "Campaign Supporters"
    ...
```

### Astro Content Collection Configuration (`src/content/config.ts`)

The `feedCollection` and `leadsCollection` definitions and their inclusion in the `collections` export should be removed.

```typescript
// REMOVE THIS
const feedCollection = defineCollection({
  ...
});

// REMOVE THIS
const leadsCollection = defineCollection({
  ...
});

// UPDATE THIS
export const collections = {
  'news': newsCollection,
  // 'feed': feedCollection, // REMOVE
  // 'leads': leadsCollection, // REMOVE
};
```

### Content Directories

The following directories must be deleted:
- `src/content/feed`
- `src/content/leads`

## 5. Success Metrics

- The "Community Feed" and "Campaign Supporters" collections no longer appear in the Decap CMS interface.
- The build process completes successfully without any errors related to the removed collections.
- The website's feed and any other features that previously used this data continue to work correctly by fetching data from the database.
- The `src/content/feed` and `src/content/leads` directories are no longer present in the repository.
