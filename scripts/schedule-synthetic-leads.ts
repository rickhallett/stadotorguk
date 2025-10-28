import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

const API_URL = process.env.API_URL || "http://localhost:4321";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error("❌ ADMIN_SECRET not found in environment variables");
  process.exit(1);
}

// Configuration
const DAYTIME_START = 8; // 8 AM
const DAYTIME_END = 22; // 10 PM
const MIN_INTERVAL_MINUTES = 45;
const MAX_INTERVAL_MINUTES = 180; // 3 hours

// Time-weighted generation (higher weight = more likely during these hours)
const PEAK_HOURS = {
  morning: { start: 8, end: 11, weight: 1.5 },
  lunch: { start: 12, end: 14, weight: 1.8 },
  afternoon: { start: 15, end: 17, weight: 1.2 },
  evening: { start: 18, end: 21, weight: 1.6 },
};

function getCurrentHour(): number {
  return new Date().getHours();
}

function isNightTime(): boolean {
  const hour = getCurrentHour();
  return hour < DAYTIME_START || hour >= DAYTIME_END;
}

function getWeightedInterval(): number {
  const hour = getCurrentHour();
  let weight = 1.0;

  // Check if we're in a peak hour
  for (const period of Object.values(PEAK_HOURS)) {
    if (hour >= period.start && hour < period.end) {
      weight = period.weight;
      break;
    }
  }

  // Calculate interval with randomness and weight
  const baseInterval = MIN_INTERVAL_MINUTES + Math.random() * (MAX_INTERVAL_MINUTES - MIN_INTERVAL_MINUTES);

  // Lower weight = shorter intervals = more frequent generation
  const adjustedInterval = baseInterval / weight;

  return adjustedInterval * 60 * 1000; // Convert to milliseconds
}

function getNextWakeTime(): number {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= DAYTIME_END) {
    // Sleep until tomorrow morning
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(DAYTIME_START, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  } else if (currentHour < DAYTIME_START) {
    // Sleep until this morning
    const thismorning = new Date(now);
    thismorning.setHours(DAYTIME_START, 0, 0, 0);
    return thismorning.getTime() - now.getTime();
  }

  return 0;
}

async function generateLead(): Promise<void> {
  try {
    console.log(`\n🎲 [${new Date().toLocaleTimeString()}] Attempting to generate synthetic lead...`);

    const response = await fetch(`${API_URL}/api/generate-lead`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ADMIN_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error(`❌ API request failed (${response.status}):`, errorData.error);
      return;
    }

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Successfully generated lead #${data.leadId}`);
      console.log(`   Name: ${data.lead.name}`);
      console.log(`   Type: ${data.lead.type}`);
      console.log(`   Comment: ${data.lead.commentLength} chars`);
    } else {
      console.error(`❌ Generation failed:`, data.error);
    }
  } catch (error) {
    console.error("❌ Error calling generation API:", error);
  }
}

async function scheduleNextGeneration(): Promise<void> {
  // Check if it's nighttime
  if (isNightTime()) {
    const sleepMs = getNextWakeTime();
    const wakeTime = new Date(Date.now() + sleepMs);
    console.log(`\n😴 Nighttime detected. Sleeping until ${wakeTime.toLocaleString()}`);
    console.log(`   (${(sleepMs / 1000 / 60 / 60).toFixed(1)} hours)\n`);

    setTimeout(() => {
      console.log(`\n☀️  Waking up at ${new Date().toLocaleString()}`);
      scheduleNextGeneration();
    }, sleepMs);
    return;
  }

  // Generate a lead
  await generateLead();

  // Calculate next interval
  const nextInterval = getWeightedInterval();
  const nextTime = new Date(Date.now() + nextInterval);

  console.log(`⏰ Next generation scheduled for ${nextTime.toLocaleTimeString()}`);
  console.log(`   (in ${(nextInterval / 1000 / 60).toFixed(1)} minutes)\n`);

  // Schedule next generation
  setTimeout(scheduleNextGeneration, nextInterval);
}

// Start the scheduler
console.log("🤖 Synthetic Lead Scheduler Started");
console.log("=====================================");
console.log(`API URL: ${API_URL}`);
console.log(`Active hours: ${DAYTIME_START}:00 - ${DAYTIME_END}:00`);
console.log(`Interval range: ${MIN_INTERVAL_MINUTES} - ${MAX_INTERVAL_MINUTES} minutes`);
console.log("=====================================\n");

scheduleNextGeneration();

// Keep the process alive
process.on("SIGINT", () => {
  console.log("\n\n🛑 Scheduler stopped by user");
  process.exit(0);
});
