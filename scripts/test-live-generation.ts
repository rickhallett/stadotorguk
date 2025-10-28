import { config } from "dotenv";

config({ path: [".env.prod", ".env"] });

const PRODUCTION_API_URL = "https://www.swanagetraffic.org.uk";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error("❌ ADMIN_SECRET not found in environment variables");
  console.error("   Please set ADMIN_SECRET in .env or .env.prod");
  process.exit(1);
}

async function testLiveGeneration() {
  console.log("🚀 Testing LIVE Lead Generation");
  console.log("================================");
  console.log(`API URL: ${PRODUCTION_API_URL}`);
  console.log(`Secret: ${ADMIN_SECRET.slice(0, 8)}...`);
  console.log("================================\n");

  console.log("⚠️  WARNING: This will create a REAL database record!");
  console.log("   Press Ctrl+C within 3 seconds to cancel...\n");

  // Give user time to cancel
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("🎲 Calling live API endpoint...\n");

  try {
    const response = await fetch(`${PRODUCTION_API_URL}/api/generate-lead`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API request failed:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${errorText}\n`);
      process.exit(1);
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ SUCCESS! Lead created in production database\n");
      console.log("📊 Lead Details:");
      console.log(`   ID: ${data.leadId}`);
      console.log(`   Name: ${data.lead.name}`);
      console.log(`   Type: ${data.lead.type}`);
      console.log(`   Comment Length: ${data.lead.commentLength} chars\n`);

      console.log("🔍 Verify on live site:");
      console.log(`   ${PRODUCTION_API_URL}/feed`);
      console.log("\n✨ Test completed successfully!");
      process.exit(0);
    } else {
      console.error("❌ API returned error:");
      console.error(`   ${data.error}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to call API:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check that the production site is deployed");
    console.error("   2. Verify ADMIN_SECRET matches production env var");
    console.error("   3. Check API endpoint exists at /api/generate-lead");
    console.error("   4. Verify ANTHROPIC_API_KEY is set in production\n");
    process.exit(1);
  }
}

testLiveGeneration();
