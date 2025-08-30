// Migration script to transfer leads from Astro content collection to Neon database
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import matter from "gray-matter";
import { createLead, type LeadData } from "../src/utils/database.js";
import { config } from "dotenv";

// Load environment variables
config({ path: [".env.local", ".env"] });

interface LeadFile {
  data: LeadData & { published?: boolean };
  filename: string;
}

async function migrateLeads() {
  console.log(
    "Starting leads migration from content collection to Neon database..."
  );

  try {
    // Get all lead files from the content directory
    const leadsDir = resolve(process.cwd(), "src/content/leads");
    const filenames = await readdir(leadsDir);
    const markdownFiles = filenames.filter((name) => name.endsWith(".md"));

    console.log(`Found ${markdownFiles.length} lead files to process`);

    // Read and parse all lead files
    const leads: LeadFile[] = [];
    for (const filename of markdownFiles) {
      try {
        const filePath = join(leadsDir, filename);
        const fileContent = await readFile(filePath, "utf-8");
        const { data } = matter(fileContent);

        // Only include published leads (default to true if not specified)
        if (data.published !== false) {
          leads.push({
            data: data as LeadData & { published?: boolean },
            filename,
          });
        }
      } catch (error) {
        console.error(`Error reading file ${filename}:`, error);
      }
    }

    console.log(`Found ${leads.length} leads to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const lead of leads) {
      try {
        const leadData: LeadData = {
          timestamp: lead.data.timestamp,
          user_id: lead.data.user_id,
          submission_id: lead.data.submission_id,
          first_name: lead.data.first_name,
          last_name: lead.data.last_name,
          name: lead.data.name,
          email: lead.data.email,
          visitor_type: lead.data.visitor_type,
          comments: lead.data.comments,
          referral_code: lead.data.referral_code,
          source: lead.data.source,
          published: lead.data.published,
        };

        const id = await createLead(leadData);
        console.log(
          `✓ Migrated lead ${lead.data.submission_id} (${lead.filename}) -> ID ${id}`
        );
        migrated++;

        // Small delay to avoid overwhelming the database
        if (migrated % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          console.log(`Progress: ${migrated}/${leads.length} leads migrated`);
        }
      } catch (error) {
        console.error(
          `✗ Failed to migrate lead ${lead.data.submission_id} (${lead.filename}):`,
          error
        );
        errors++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`✓ Successfully migrated: ${migrated} leads`);
    console.log(`✗ Failed migrations: ${errors} leads`);
    console.log(`Total processed: ${migrated + errors}/${leads.length} leads`);

    if (errors > 0) {
      console.warn(
        `\nWarning: ${errors} leads failed to migrate. Check the error messages above.`
      );
      process.exit(1);
    } else {
      console.log("\n🎉 All leads successfully migrated to Neon database!");
      process.exit(0);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLeads();
}

export { migrateLeads };
