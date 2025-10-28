# Synthetic Lead Generation System

Automated system for generating realistic community feedback using Claude Haiku 4.5.

## Overview

This system generates plausible, lexically unique community comments by:
1. Sampling 3-5 random existing leads from the database
2. Using Claude Haiku 4.5 to generate semantically similar but lexically unique comments
3. Validating uniqueness using n-gram similarity analysis (must be <20% similar)
4. Creating realistic UK-based user metadata (names, emails, visitor types)
5. Storing leads with `source: 'synthetic'` flag for tracking

## Components

### 1. Core Generation Script
**File:** `scripts/generate-synthetic-lead.ts`

Standalone script that generates one synthetic lead.

**Usage:**
```bash
# Dry run (no database writes)
npm run generate-lead

# Programmatic use
import { generateSyntheticLead } from './scripts/generate-synthetic-lead';
const lead = await generateSyntheticLead(false); // false = write to DB
```

**Features:**
- Random sampling of existing leads
- Claude Haiku 4.5 integration (cost-effective)
- N-gram similarity checking
- UK name/email generation
- Visitor type distribution matching

### 2. API Endpoint
**File:** `src/pages/api/generate-lead.ts`

Protected API endpoint for on-demand generation.

**Usage:**
```bash
# Add ADMIN_SECRET to your .env file
echo "ADMIN_SECRET=13DWXIX+XvKN+iM0bgxQEa/MQApfzQGO" >> .env

# Call the API
curl -X POST http://localhost:4321/api/generate-lead \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "leadId": 245,
  "lead": {
    "name": "Harry Evans",
    "type": "Local",
    "commentLength": 207
  }
}
```

### 3. Local Scheduler
**File:** `scripts/schedule-synthetic-leads.ts`

Background process that generates leads at semi-random intervals during daytime hours by calling the local dev server API.

**Usage:**
```bash
# Add required env vars to .env or .env.development.local
ADMIN_SECRET=13DWXIX+XvKN+iM0bgxQEa/MQApfzQGO
API_URL=http://localhost:4321
ANTHROPIC_API_KEY=sk-ant-api03-...

# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start local scheduler
npm run schedule-leads
```

### 4. Production Scheduler
**File:** `scripts/schedule-production-leads.ts`

Background process that generates leads in production by calling the live API endpoint.

**Usage:**
```bash
# Add required env vars to .env.prod
ADMIN_SECRET=13DWXIX+XvKN+iM0bgxQEa/MQApfzQGO

# Start production scheduler (hits live site)
npm run schedule-leads-production
```

**Features:**
- Only runs 8 AM - 10 PM (sleeps at night)
- Semi-random intervals: 45-180 minutes
- Time-weighted generation (more frequent during peak hours)
- Peak hours:
  - Morning (8-11 AM): 1.5x weight
  - Lunch (12-2 PM): 1.8x weight
  - Afternoon (3-5 PM): 1.2x weight
  - Evening (6-9 PM): 1.6x weight

**Sample Output:**
```
🤖 Synthetic Lead Scheduler Started
=====================================
API URL: http://localhost:4321
Active hours: 8:00 - 22:00
Interval range: 45 - 180 minutes
=====================================

🎲 [10:32:15 AM] Attempting to generate synthetic lead...
✅ Successfully generated lead #247
   Name: Sarah Thompson
   Type: Local
   Comment: 156 chars
⏰ Next generation scheduled for 11:47:23 AM
   (in 75.1 minutes)
```

## Configuration

### Required Environment Variables

```bash
# .env or .env.local

# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Admin secret for API protection (generate with: openssl rand -base64 32)
ADMIN_SECRET=your-random-secret-here

# API URL (for scheduler script)
API_URL=http://localhost:4321  # Development
# API_URL=https://your-site.com  # Production
```

### Optional Configuration

Edit `scripts/schedule-synthetic-leads.ts` to adjust:
```typescript
const DAYTIME_START = 8;     // Start hour (8 AM)
const DAYTIME_END = 22;      // End hour (10 PM)
const MIN_INTERVAL_MINUTES = 45;   // Minimum wait time
const MAX_INTERVAL_MINUTES = 180;  // Maximum wait time (3 hours)
```

## LLM Configuration

**Model:** `claude-haiku-4-5`
- Cost: $1/5 per million input/output tokens
- Temperature: 0.9 (high creativity for uniqueness)
- Max tokens: 150 per generation

**Estimated Costs:**
- ~500 tokens per generation (prompt + response)
- ~$0.003 per lead generated
- ~$0.10 for 30 leads
- ~$3.00 for 1000 leads

## Uniqueness Validation

Comments are validated against all existing leads using:
1. **N-gram similarity** (trigrams)
2. **Threshold:** Must be <20% similar to any existing comment
3. **Retry logic:** Up to 3 attempts with increasing temperature

## Database Schema

Synthetic leads are stored with:
```typescript
{
  source: 'synthetic',           // Identifies generated content
  user_id: 'synthetic_timestamp',
  submission_id: 'synthetic_timestamp_random',
  published: true,
  // ... standard lead fields
}
```

## Testing

```bash
# Test generation (dry run, no DB writes)
npm run generate-lead

# Test API endpoint (requires dev server running)
npm run dev  # In terminal 1

# In terminal 2:
curl -X POST http://localhost:4321/api/generate-lead \
  -H "Authorization: Bearer ${ADMIN_SECRET}"

# Test scheduler (requires dev server running)
npm run schedule-leads
```

## Production Deployment

### Option 1: Local Machine Hitting Production (Recommended)
Run the production scheduler on your local machine to generate leads on the live site:

```bash
# Ensure .env.prod has ADMIN_SECRET set
# This will call https://www.swanagetraffic.org.uk/api/generate-lead
npm run schedule-leads-production
```

The scheduler will automatically sleep at night and resume in the morning.

**Advantages:**
- No server costs
- Easy to start/stop
- Can run on your development machine
- Automatic nighttime sleep

### Option 2: Local Development Server
Run the scheduler against your local dev server for testing:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start local scheduler
npm run schedule-leads
```

### Option 3: Long-Running Server
Deploy the scheduler on a VPS or dedicated server:

```bash
# Using PM2 for process management
npm install -g pm2

# Start scheduler
pm2 start "npm run schedule-leads" --name synthetic-leads

# View logs
pm2 logs synthetic-leads

# Stop scheduler
pm2 stop synthetic-leads
```

### Option 4: Manual Triggers
Use the API endpoint with your own scheduling system:
- GitHub Actions workflows
- Local cron jobs calling the API
- Shortcuts app on iOS/macOS
- Custom automation tools

## Monitoring

The scheduler outputs detailed logs:
- Generation attempts
- Success/failure status
- Lead metadata (name, type, comment length)
- Next scheduled time
- Sleep/wake notifications

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**
- Add key to `.env` file
- Verify file is loaded: `config({ path: [".env.local", ".env"] })`

**"Unauthorized" from API**
- Check `ADMIN_SECRET` matches in `.env` and request header
- Use format: `Bearer YOUR_SECRET` in Authorization header

**"Failed to generate unique comment"**
- Indicates 3 failed attempts due to similarity
- Increase temperature in `generateCommentWithLLM()`
- Reduce similarity threshold in `isCommentUnique()`

**Scheduler not running**
- Check `API_URL` is correct
- Verify dev server is running on specified port
- Ensure not in nighttime hours (8 AM - 10 PM only)

## Security Notes

- Never commit `.env` files with real secrets
- Rotate `ADMIN_SECRET` regularly
- Monitor API endpoint access logs
- Consider rate limiting the API endpoint
- Mark synthetic leads clearly in database (`source: 'synthetic'`)

## Future Improvements

- [ ] Add GPT-4 model option for variety
- [ ] Implement more sophisticated name generation (weighted by region)
- [ ] Add sentiment analysis to match existing lead distribution
- [ ] Create admin dashboard for monitoring generation
- [ ] Add webhook notifications for failures
- [ ] Implement automatic retry with exponential backoff
