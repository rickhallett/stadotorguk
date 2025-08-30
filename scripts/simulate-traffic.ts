import { incrementPageCount } from '../src/utils/database';
import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

const VIEWS_PER_DAY = 25;
const PEAK_HOURS = {
  morning: { start: 8, end: 10, weight: 0.4 },
  lunch: { start: 12, end: 14, weight: 0.3 },
  evening: { start: 18, end: 21, weight: 0.3 },
};

function getRandomInterval(currentHour: number): number {
  let baseInterval = (24 * 60 * 60 * 1000) / VIEWS_PER_DAY;

  for (const period of Object.values(PEAK_HOURS)) {
    if (currentHour >= period.start && currentHour < period.end) {
      baseInterval /= (period.weight * Object.keys(PEAK_HOURS).length);
    }
  }

  // Add some randomness
  return baseInterval * (0.5 + Math.random());
}

async function simulateView() {
  try {
    const newCount = await incrementPageCount();
    console.log(`Successfully incremented page view. New count: ${newCount}`);
  } catch (error) {
    console.error('Failed to increment page view:', error);
  }

  const currentHour = new Date().getHours();
  const interval = getRandomInterval(currentHour);
  
  console.log(`Next view in ${(interval / 1000 / 60).toFixed(2)} minutes.`);
  setTimeout(simulateView, interval);
}

console.log('Starting traffic simulation...');
simulateView();
