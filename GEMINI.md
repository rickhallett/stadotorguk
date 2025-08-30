# Project Overview

This is a website for the Swanage Traffic Alliance, built with [Astro](https://astro.build/). It uses [React](https://react.dev/) for interactive components, a [Neon](https://neon.tech/) serverless Postgres database for data storage, and [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) for content management. The site is deployed on [Vercel](https://vercel.com/).

The main feature of the website is a sign-up form that allows users to join the alliance. The form collects user information, which is then stored in the Neon database and backed up to a GitHub repository as markdown files. The website also displays statistics about the number of members.

## Building and Running

### Prerequisites

- [Bun](https://bun.sh/)
- An environment file (`.env`) with the following variables:
  - `DATABASE_URL`: The connection string for the Neon database.
  - `GITHUB_TOKEN`: A GitHub personal access token with repository write access for backing up leads.

### Commands

| Command | Action |
| :--- | :--- |
| `bun install` | Installs dependencies |
| `bun dev` | Starts local dev server at `localhost:4321` |
| `bun build` | Build your production site to `./dist/` |
| `bun preview` | Preview your build locally, before deploying |
| `bun astro ...` | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI |
| `bun run migrate-leads` | Run the script to migrate leads from CSV to the database. |
| `bun run test-migration` | Run the script to test the lead migration. |

## Development Conventions

### Code Style

The project uses the standard Astro and React coding styles. TypeScript is used for type safety.

### Testing

There are no specific testing frameworks set up for this project, but there are scripts for testing the data migration.

### Content Management

Content is managed through Decap CMS. The configuration for the CMS can be found in `public/admin/config.yml`. The content itself is stored in the `src/content` directory.

### Database

The database schema is not explicitly defined in the repository, but it can be inferred from the code in `src/utils/database.ts`. The schema consists of at least two tables: `leads` and `page_views`.
