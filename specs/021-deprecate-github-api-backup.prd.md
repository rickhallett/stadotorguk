# PRD 021: Deprecate GitHub API Backup

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the plan to deprecate the use of the GitHub API for backing up new lead submissions. All lead data is now reliably stored in the primary Neon database, making the GitHub backup redundant and an unnecessary dependency. This change will simplify the submission process, remove unneeded complexity, and eliminate a potential point of failure.

## 2. Problem Statement

The current lead submission process, handled by the API endpoint at `src/pages/api/submit-lead.ts`, includes a secondary step to back up lead data as a markdown file to a GitHub repository. This was implemented as a fallback mechanism but is no longer necessary with the Neon database serving as a stable and reliable primary data store.

The problems with the current approach are:
- **Redundancy:** The Neon database is the single source of truth for lead data. The GitHub backup is a redundant copy that is not actively used.
- **Complexity:** The code for handling the GitHub backup adds unnecessary complexity to the `submit-lead` API endpoint.
- **Dependency:** It creates a dependency on the GitHub API and a `GITHUB_TOKEN`, which is another secret to manage.
- **Potential Point of Failure:** Although the backup is designed to be non-critical, it still introduces a potential point of failure and adds noise to the logs if it fails.
- **No Similar Backup for Views:** There is no similar backup mechanism for page views, which are also stored in the Neon database. This indicates an inconsistent data management strategy.

## 3. Requirements

### Functional Requirements

- The system must no longer make any API calls to GitHub to back up lead data.
- The lead submission process must continue to save lead data to the Neon database as the primary and only data store.

### Technical Requirements

- Remove all code related to the GitHub backup from `src/pages/api/submit-lead.ts`.
- Remove the dependency on the `GITHUB_TOKEN` environment variable for the lead submission feature.
- Ensure the `submit-lead` endpoint continues to function correctly, saving data to the database and returning a successful response.

## 4. Implementation Notes

The primary file to be modified is `src/pages/api/submit-lead.ts`.

The following code block should be removed:

```typescript
// Secondary: Backup to GitHub (optional, continues even if it fails)
if (process.env.GITHUB_TOKEN) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const { name, email, postcode, "i-want-to-volunteer": volunteer } = formData;
    const content = `---
name: ${name}
email: ${email}
postcode: ${postcode}
volunteer: ${volunteer || false}
---
`;
    const filename = `src/content/leads/${new Date().toISOString()}-${email}.md`;
    await octokit.repos.createOrUpdateFileContents({
      owner: 'sta-dot-co-uk',
      repo: 'sta-dot-co-uk',
      path: filename,
      message: `New lead: ${email}`,
      content: Buffer.from(content).toString('base64'),
    });
    console.log(`Lead backed up to GitHub: ${filename}`);
  } catch (githubError: any) {
    console.warn('GitHub backup failed (non-critical):', githubError.message);
    // Continue execution - GitHub backup failure is not critical
  }
} else {
  console.log('GitHub token not configured, skipping backup');
}
```

The `Octokit` import should also be removed:

```typescript
import { Octokit } from '@octokit/rest';
```

Finally, the `GITHUB_TOKEN` can be removed from the `.env` file and from any CI/CD environment variable configurations.

## 5. Success Metrics

- The `submit-lead` API endpoint successfully saves leads to the Neon database without attempting to back them up to GitHub.
- The application logs no longer show messages related to GitHub backups (successful or failed).
- The `GITHUB_TOKEN` is no longer required for the application to run.
