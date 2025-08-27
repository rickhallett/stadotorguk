# Vercel Edge Config Setup for Page Counter

This guide walks through setting up Vercel Edge Config to power the site's page view counter.

## Prerequisites

- Vercel account (free or paid)
- Project deployed to Vercel
- Access to Vercel dashboard

## Step 1: Create an Edge Config Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the "Storage" tab
3. Click "Create Database" → Select "Edge Config"
4. Name your store (e.g., `sta-page-counter`)
5. Click "Create"

## Step 2: Initialize the Counter

1. Open your newly created Edge Config store
2. Click "Edit" or "Add Item"
3. Add the following key-value pair:
   ```json
   {
     "page_views": 0
   }
   ```
4. Click "Save"

## Step 3: Connect to Your Project

1. In the Edge Config dashboard, click "Projects" tab
2. Click "Connect Project"
3. Select your Swanage Traffic Alliance project
4. The `EDGE_CONFIG` environment variable will be automatically added

## Step 4: Get Your Edge Config ID

1. In the Edge Config dashboard, look at the URL
2. It will be something like: `https://vercel.com/your-team/stores/ecfg_abc123xyz`
3. Copy the ID part: `ecfg_abc123xyz`

## Step 5: Create a Vercel API Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it (e.g., `STA Edge Config Writer`)
4. Set expiration (recommended: 1 year)
5. Select scope: "Full Account" or custom with Edge Config permissions
6. Click "Create Token"
7. **IMPORTANT**: Copy the token immediately (you won't see it again)

## Step 6: Add Environment Variables

In your Vercel project settings → Environment Variables, add:

### Required Variables:

```bash
# Already set automatically when you connected Edge Config
EDGE_CONFIG=[automatically set]

# Edge Config ID from Step 4
EDGE_CONFIG_ID=ecfg_abc123xyz

# API Token from Step 5
VERCEL_API_TOKEN=your_token_here
```

### Optional Variable (for team accounts):

```bash
# Only if using a team account
VERCEL_TEAM_ID=team_xyz123
```

To find your Team ID:
1. Go to Team Settings → General
2. Look for "Team ID"

## Step 7: Deploy and Test

1. Redeploy your project to pick up the new environment variables:
   ```bash
   vercel --prod
   ```

2. Visit your site and check if the counter appears in the footer

3. Refresh the page and verify the count increments

## Testing the API Endpoints

### Read current count (doesn't increment):
```bash
curl https://your-site.vercel.app/api/counter?action=read
```

### Increment and get new count:
```bash
curl -X POST https://your-site.vercel.app/api/counter?action=increment
```

## Monitoring

1. Check Edge Config dashboard for current value
2. View function logs in Vercel dashboard → Functions tab
3. Monitor API usage in Vercel dashboard → Usage tab

## Troubleshooting

### Counter shows "---" or error
- Check that all environment variables are set correctly
- Verify Edge Config store has `page_views` key initialized
- Check function logs for errors

### Counter doesn't increment
- Ensure `VERCEL_API_TOKEN` has write permissions
- Verify `EDGE_CONFIG_ID` matches your store
- Check if you need `VERCEL_TEAM_ID` for team accounts

### Rate Limiting
- Edge Config reads: Practically unlimited
- Edge Config writes: Generous limits, suitable for page counters
- If hitting limits, consider batching updates or using sampling

## Security Notes

1. **Never commit tokens to git**
2. The `VERCEL_API_TOKEN` should only be in environment variables
3. Consider rotating tokens periodically
4. Use separate tokens for different purposes

## Manual Counter Management

If you need to manually adjust the counter:

1. Go to Edge Config dashboard
2. Click "Edit" on the `page_views` key
3. Update the value
4. Click "Save"

Changes propagate globally within seconds.

## Additional Resources

- [Vercel Edge Config Documentation](https://vercel.com/docs/storage/edge-config)
- [Edge Config API Reference](https://vercel.com/docs/storage/edge-config/vercel-api)
- [Edge Config Limits](https://vercel.com/docs/storage/edge-config/limits)