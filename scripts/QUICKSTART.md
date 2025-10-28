# Synthetic Lead Generation - Quick Start

## What Was Built

A complete system for generating realistic community feedback using Claude Haiku 4.5, with both local testing and production deployment options.

## Files Created

1. **`scripts/generate-synthetic-lead.ts`** - Core generation logic
2. **`src/pages/api/generate-lead.ts`** - API endpoint
3. **`scripts/schedule-synthetic-leads.ts`** - Local dev scheduler
4. **`scripts/schedule-production-leads.ts`** - Production scheduler
5. **`scripts/test-live-generation.ts`** - Production test script
6. **`scripts/README-synthetic-leads.md`** - Full documentation

## Quick Commands

### Test Generation (Dry Run)
```bash
npm run generate-lead
```
Generates a synthetic lead without writing to database. Shows what would be created.

### Test Live Production API
```bash
npm run test-live-generation
```
Creates ONE real lead in production database. Use to verify everything works.

### Run Local Scheduler (Dev)
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run schedule-leads
```
Generates leads against local dev server. Good for testing.

### Run Production Scheduler (Recommended)
```bash
npm run schedule-leads-production
```
Runs scheduler that hits live production API. Creates real leads on live site.
- Runs 8 AM - 10 PM only
- Semi-random intervals: 45-180 minutes
- Weighted by peak hours
- Ctrl+C to stop

## Environment Setup

### Required Variables

Add to `.env.prod`:
```bash
ADMIN_SECRET=13DWXIX+XvKN+iM0bgxQEa/MQApfzQGO
```

### Vercel Production Variables (Already Set)
- `ADMIN_SECRET` - Authorization token
- `ANTHROPIC_API_KEY` - Claude API key

## How It Works

1. **Scheduler** runs on your local machine
2. **Calls production API** at `https://www.swanagetraffic.org.uk/api/generate-lead`
3. **API endpoint** (running on Vercel) generates the lead:
   - Fetches 3-5 existing comments from database
   - Sends to Claude Haiku 4.5 to generate unique comment
   - Validates uniqueness (<20% similarity)
   - Creates lead with synthetic flag
4. **Lead appears** on `/feed` page immediately

## What Gets Generated

Each synthetic lead includes:
- **Name**: Random UK name (e.g., "Sarah Thompson")
- **Email**: Generated email (e.g., sarah.thompson@gmail.com)
- **Visitor Type**: Matches existing distribution (mostly "Local")
- **Comment**: Unique traffic-related comment (variable length: 10-200 words)
  - Short comments (40%): Quick, punchy observations
  - Medium comments (30%): More detailed concerns
  - Long comments (20%): In-depth reasoning
  - Very long comments (10%): Comprehensive analysis
- **Source**: Tagged as `synthetic` in database

## Cost

- ~$0.003 per lead generated
- ~$0.10 for 30 leads/day
- ~$3.00 for 1000 leads/month

## Verification

After running scheduler or test script, verify leads on:
https://www.swanagetraffic.org.uk/feed

## Debugging

If you get 401 Unauthorized:
```bash
# Check that ADMIN_SECRET matches
vercel env ls production | grep ADMIN_SECRET
```

If generation fails:
- Check Vercel logs: `vercel logs https://www.swanagetraffic.org.uk`
- Verify `ANTHROPIC_API_KEY` is set in production
- Check for database connection issues

## Recommended Usage

**For Daily Operation:**
```bash
npm run schedule-leads-production
```

Leave this running in a terminal on your local machine. It will:
- Generate 5-15 leads per day
- Only run during daytime hours (8 AM - 10 PM)
- Automatically sleep at night
- Resume when you restart it

Press `Ctrl+C` to stop when needed.

## Safety Features

- All synthetic leads tagged with `source: 'synthetic'`
- 3-attempt retry with uniqueness validation
- Authorization required for API endpoint
- No database access needed on local machine
- Rate-limited by design (45-180 minute intervals)

## Next Steps

1. ✅ Test with `npm run test-live-generation`
2. ✅ Start scheduler with `npm run schedule-leads-production`
3. ✅ Monitor `/feed` page for new leads
4. ✅ Let it run continuously during the day

That's it! The system is fully operational.
