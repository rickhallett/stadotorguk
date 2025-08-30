# 016 - Site Traffic Simulation Script

**Version:** 1.0
**Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for creating a script to simulate website traffic. The script will programmatically increment the site's page view counter at realistic intervals to create the appearance of an active user base. This will be useful for development, testing, and demonstration purposes.

## 2. Problem Statement

The website currently has a low volume of organic traffic, resulting in a static or slow-moving page view counter. This can make the site appear inactive to new visitors and stakeholders. A traffic simulation script is needed to artificially inflate the view count in a controlled and realistic manner.

## 3. Requirements

### Functional Requirements

- The script must increment the page view counter by approximately 25 views per day.
- The simulated views should be distributed throughout the day to mimic real user activity, with peaks during three main periods:
    - Morning (e.g., 8am - 10am)
    - Lunchtime (e.g., 12pm - 2pm)
    - Evening (e.g., 6pm - 9pm)
- The script should be executable via a `bun run` command.
- The script should log its activity to the console (e.g., "Incrementing page view... New count: X").

### Technical Requirements

- A new script file will be created at `scripts/simulate-traffic.ts`.
- The script will use the existing `incrementPageCount` function from `src/utils/database.ts`.
- The script will use `setTimeout` with randomized intervals to simulate the time between page views.
- A new script named `simulate-traffic` will be added to the `scripts` section of `package.json`.

## 4. Implementation Notes

### Traffic Simulation Script (`scripts/simulate-traffic.ts`)

The script will define the peak traffic periods and calculate random intervals between view increments.

```typescript
import { incrementPageCount } from '../src/utils/database';

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
```

### `package.json`

A new script will be added to run the simulation.

```json
{
  "scripts": {
    ...
    "simulate-traffic": "tsx scripts/simulate-traffic.ts"
  }
}
```

## 5. Success Metrics

- When the script is run, the page view count in the `page_views` table increases by approximately 25 over a 24-hour period.
- The console logs indicate that the script is running and successfully incrementing the counter.

## 6. Future Enhancements

- The script could be enhanced to accept the number of daily views as a command-line argument.
- The simulation could be made more sophisticated by targeting different pages or simulating user sessions.
- The script could be deployed as a cron job or a serverless function to run automatically.
