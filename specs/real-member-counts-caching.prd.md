# Product Requirements Document: Real Member Counts with Intelligent Caching

## Executive Summary
This PRD outlines the implementation of real-time member statistics fetched from the Decap CMS leads collection, replacing all mock/hardcoded numbers throughout the site. The solution includes multiple caching strategies to optimize performance, minimize build times, and prevent excessive data processing while maintaining data freshness.

## Problem Statement

### Current Issues
1. **Mock Data Prevalence**: Multiple pages use hardcoded numbers (1234, 42, 189, 567) that don't reflect actual supporter counts
2. **Data Inconsistency**: Different variant pages show different mock numbers, creating confusion
3. **Missed Opportunity**: Real supporter data exists in leads collection but isn't being utilized
4. **Trust Issues**: Showing fake numbers undermines the campaign's credibility
5. **Manual Updates**: Any number changes require code modifications and redeployment

### Performance Concerns
- **Build Time Impact**: With 400+ lead files, processing counts on every page during build is expensive
- **Redundant Computation**: Same calculations repeated across multiple pages and variants
- **Scalability**: As leads grow to thousands, build times will increase linearly
- **Freshness vs Performance**: Need balance between real-time data and site performance

## Requirements

### Functional Requirements

#### 1. Data Points to Calculate
```typescript
interface MemberStats {
  total: number;           // Total all-time members
  today: number;           // Joined in last 24 hours
  thisWeek: number;        // Joined in last 7 days
  thisMonth: number;       // Joined in last 30 days
  
  // Breakdown by type
  byType: {
    Local: number;
    Visitor: number;
    Tourist: number;
    Other: number;
  };
  
  // Growth metrics
  growth: {
    dailyAverage: number;  // Average signups per day
    weeklyGrowth: number;  // Percentage growth week-over-week
    trend: 'up' | 'down' | 'stable';
  };
  
  // Metadata
  lastUpdated: string;     // ISO timestamp of calculation
  cacheVersion: string;    // For cache invalidation
}
```

#### 2. Pages Requiring Real Data
- `/feed.astro` - All counter displays
- `/supporters/index.astro` - Main counter and breakdowns
- All variant pages (`/v1/feed.astro` through `/v5/feed.astro`)
- Future: Homepage statistics blocks

### Technical Requirements

## Implementation Architecture

### Recommended Solution: Multi-Tier Caching System

#### Tier 1: Build-Time Computation Module
```typescript
// src/utils/memberStats.ts
import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = '.cache/member-stats.json';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getMemberStats(options = { useCache: true }) {
  // Check cache first
  if (options.useCache && fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    
    if (age < CACHE_DURATION) {
      return cache;
    }
  }
  
  // Compute fresh stats
  const stats = await computeMemberStats();
  
  // Save to cache
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(stats, null, 2));
  
  return stats;
}

async function computeMemberStats(): Promise<MemberStats> {
  const leads = await getCollection('leads', ({ data }) => data.published);
  const now = new Date();
  
  // Time-based filtering
  const today = leads.filter(lead => {
    const date = new Date(lead.data.timestamp);
    return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
  });
  
  const thisWeek = leads.filter(lead => {
    const date = new Date(lead.data.timestamp);
    return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  
  const thisMonth = leads.filter(lead => {
    const date = new Date(lead.data.timestamp);
    return (now.getTime() - date.getTime()) < 30 * 24 * 60 * 60 * 1000;
  });
  
  // Type breakdown
  const byType = leads.reduce((acc, lead) => {
    const type = lead.data.visitor_type || 'Local';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Growth calculations
  const sortedLeads = [...leads].sort((a, b) => 
    new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime()
  );
  
  const firstDate = sortedLeads[0] ? new Date(sortedLeads[0].data.timestamp) : now;
  const daysSinceStart = Math.max(1, (now.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000));
  const dailyAverage = Math.round(leads.length / daysSinceStart);
  
  // Week-over-week growth
  const lastWeek = leads.filter(lead => {
    const date = new Date(lead.data.timestamp);
    const daysAgo = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
    return daysAgo >= 7 && daysAgo < 14;
  });
  
  const weeklyGrowth = lastWeek.length > 0 
    ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
    : 100;
    
  const trend = weeklyGrowth > 5 ? 'up' : weeklyGrowth < -5 ? 'down' : 'stable';
  
  return {
    total: leads.length,
    today: today.length,
    thisWeek: thisWeek.length,
    thisMonth: thisMonth.length,
    byType: {
      Local: byType.Local || 0,
      Visitor: byType.Visitor || 0,
      Tourist: byType.Tourist || 0,
      Other: byType.Other || 0,
    },
    growth: {
      dailyAverage,
      weeklyGrowth,
      trend,
    },
    lastUpdated: now.toISOString(),
    cacheVersion: '1.0.0',
  };
}
```

#### Tier 2: Generated Static Module
```typescript
// scripts/generate-stats.js (build script)
import { getMemberStats } from '../src/utils/memberStats.js';
import fs from 'fs';

async function generateStatsModule() {
  const stats = await getMemberStats({ useCache: false });
  
  const moduleContent = `
// Auto-generated file - DO NOT EDIT
// Generated: ${new Date().toISOString()}

export const memberStats = ${JSON.stringify(stats, null, 2)};

export default memberStats;
`;
  
  fs.writeFileSync('src/data/memberStats.generated.ts', moduleContent);
  console.log('✅ Member stats module generated');
}

generateStatsModule();
```

#### Tier 3: API Route for Client Updates (Optional)
```typescript
// src/pages/api/stats.json.ts
import type { APIRoute } from 'astro';
import { getMemberStats } from '../../utils/memberStats';

export const GET: APIRoute = async () => {
  try {
    const stats = await getMemberStats();
    
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Usage in Components

#### Feed Page Implementation
```astro
---
// src/pages/feed.astro
import { getMemberStats } from '../utils/memberStats';

// Get real stats at build time
const stats = await getMemberStats();
const { total, today, thisWeek, thisMonth } = stats;
---

<BrutalSection title="THE UNCONSULTED MAJORITY">
    <div class="user-counter">
        <div class="counter-block counter-total">
            <div class="data-stat" data-value={total}>{total}</div>
            <div class="counter-label">Total Active Members</div>
        </div>
        <div class="counter-block">
            <div class="data-stat" data-value={today}>{today}</div>
            <div class="counter-label">Joined Today</div>
        </div>
        <div class="counter-block">
            <div class="data-stat" data-value={thisWeek}>{thisWeek}</div>
            <div class="counter-label">Joined This Week</div>
        </div>
        <div class="counter-block">
            <div class="data-stat" data-value={thisMonth}>{thisMonth}</div>
            <div class="counter-label">Joined This Month</div>
        </div>
    </div>
    
    <!-- Optional: Show data freshness -->
    <div class="stats-meta">
        <small>Last updated: {new Date(stats.lastUpdated).toLocaleString()}</small>
    </div>
</BrutalSection>
```

#### Progressive Enhancement (Optional)
```html
<script>
  // Optionally fetch fresh stats after page load
  async function updateStats() {
    try {
      const response = await fetch('/api/stats.json');
      const freshStats = await response.json();
      
      // Update counters if different
      updateCounter('total', freshStats.total);
      updateCounter('today', freshStats.today);
      updateCounter('week', freshStats.thisWeek);
      updateCounter('month', freshStats.thisMonth);
      
      // Update timestamp
      const metaElement = document.querySelector('.stats-meta small');
      if (metaElement) {
        metaElement.textContent = `Last updated: ${new Date(freshStats.lastUpdated).toLocaleString()}`;
      }
    } catch (error) {
      console.log('Using static stats - API update failed');
    }
  }
  
  function updateCounter(id, newValue) {
    const element = document.querySelector(`[data-stat-id="${id}"]`);
    if (element && element.textContent !== newValue.toString()) {
      // Animate change
      element.style.opacity = '0.5';
      setTimeout(() => {
        element.textContent = newValue;
        element.style.opacity = '1';
      }, 300);
    }
  }
  
  // Only update if page has been open for > 1 minute
  setTimeout(updateStats, 60000);
</script>
```

## Caching Strategy Comparison

### Option 1: Pure Static (Recommended for MVP)
**Implementation**: Build-time computation only
**Pros**: 
- Simplest implementation
- Zero runtime overhead
- Works with static hosting
**Cons**: 
- Data staleness between builds
- Requires rebuild for updates
**Update Frequency**: On each deployment

### Option 2: Hybrid Static + API
**Implementation**: Static baseline + client-side updates
**Pros**:
- Fresh data without rebuild
- Progressive enhancement
- Good UX with instant display
**Cons**:
- Requires API route
- Additional client-side code
**Update Frequency**: Every 60 seconds while page is open

### Option 3: Edge Functions
**Implementation**: Compute at edge with caching
**Pros**:
- Near real-time updates
- No rebuild needed
- Distributed caching
**Cons**:
- Vendor lock-in (Vercel/Netlify)
- Additional complexity
- Cost at scale
**Update Frequency**: Every 5 minutes

### Option 4: ISR (Incremental Static Regeneration)
**Implementation**: Astro SSR mode with revalidation
**Pros**:
- Automatic background updates
- No client-side code
- Good balance of fresh/performance
**Cons**:
- Requires SSR hosting
- More complex deployment
- Higher hosting costs
**Update Frequency**: Configurable (e.g., every 60 seconds)

### Option 5: GitHub Actions + Webhooks
**Implementation**: Rebuild on leads folder changes
**Pros**:
- Always fresh after new signups
- No wasted builds
- Uses existing CI/CD
**Cons**:
- Build queue delays
- GitHub Actions minutes usage
- Complex webhook setup
**Update Frequency**: On each new lead

## Migration Plan

### Phase 1: Basic Implementation (Week 1)
1. Create `memberStats.ts` utility module
2. Replace mock data in `/feed.astro`
3. Test build performance with full dataset
4. Add build-time cache (`.cache/` directory)

### Phase 2: Rollout (Week 2)
1. Update all pages
2. Update supporters pages
3. Add stats to homepage if needed
4. Monitor build times

### Phase 3: Optimization (Week 3)
1. Implement chosen caching strategy
2. Add API route if using hybrid approach
3. Set up GitHub Actions optimization
4. Add performance monitoring

### Phase 4: Enhancement (Week 4)
1. Add growth metrics display
2. Implement trend indicators
3. Add data freshness indicators
4. Create admin dashboard for stats

## Performance Considerations

### Build Performance
- **Current**: ~2-3 seconds (with mock data)
- **Expected with 500 leads**: ~3-4 seconds (with caching)
- **Expected with 5000 leads**: ~5-7 seconds (with caching)
- **Without caching**: Add 2-3 seconds per page

### Optimization Techniques
1. **Parallel Processing**: Use `Promise.all()` for multiple calculations
2. **Memoization**: Cache computed values during single build
3. **Incremental Computation**: Only process new leads since last build
4. **File System Cache**: Persist calculations between builds

### Cache Invalidation Strategy
```typescript
// Intelligent cache invalidation
function shouldInvalidateCache(cache: CacheData): boolean {
  // Age-based invalidation
  if (Date.now() - cache.timestamp > MAX_AGE) return true;
  
  // Version-based invalidation
  if (cache.version !== CURRENT_VERSION) return true;
  
  // Content-based invalidation (check lead count)
  const currentLeadCount = fs.readdirSync('src/content/leads').length;
  if (cache.leadCount !== currentLeadCount) return true;
  
  return false;
}
```

## Success Metrics

### Performance KPIs
- Build time remains under 10 seconds with 1000+ leads
- Page load time < 2 seconds
- Time to First Byte (TTFB) < 200ms
- Zero layout shift from counter updates

### Data Quality KPIs
- 100% accuracy in member counts
- Data freshness < 5 minutes (with caching)
- Zero discrepancies between pages
- Proper timezone handling for "today" calculations

### User Experience KPIs
- Increased trust from real numbers
- Higher engagement with supporter page
- Improved conversion on signup forms
- Reduced bounce rate on feed page

## Security Considerations

### Data Privacy
- No PII exposed in stats API
- Aggregate counts only
- No individual lead data in client-side code

### Rate Limiting
```typescript
// API route rate limiting
const rateLimiter = new Map();

export const GET: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limit = rateLimiter.get(ip) || 0;
  
  if (limit > 10) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  rateLimiter.set(ip, limit + 1);
  setTimeout(() => rateLimiter.delete(ip), 60000); // Reset after 1 minute
  
  // ... rest of implementation
};
```

## Testing Strategy

### Unit Tests
```typescript
// tests/memberStats.test.ts
describe('Member Stats Calculation', () => {
  it('should correctly count total members', async () => {
    const stats = await getMemberStats();
    expect(stats.total).toBeGreaterThan(0);
  });
  
  it('should correctly filter by date ranges', async () => {
    const stats = await getMemberStats();
    expect(stats.today).toBeLessThanOrEqual(stats.thisWeek);
    expect(stats.thisWeek).toBeLessThanOrEqual(stats.thisMonth);
    expect(stats.thisMonth).toBeLessThanOrEqual(stats.total);
  });
  
  it('should handle empty dataset gracefully', async () => {
    const stats = await computeMemberStats([]);
    expect(stats.total).toBe(0);
    expect(stats.growth.trend).toBe('stable');
  });
});
```

### Integration Tests
- Verify stats module generates correctly during build
- Test cache invalidation logic
- Validate API endpoint responses
- Check progressive enhancement doesn't break static display

### Performance Tests
- Measure build time with varying lead counts (100, 500, 1000, 5000)
- Profile memory usage during computation
- Test cache hit/miss ratios
- Benchmark API response times

## Future Enhancements

### Near-term (1-2 months)
1. **Real-time Updates**: WebSocket connection for live counter updates
2. **Geographic Stats**: Show member distribution by location
3. **Historical Trends**: Chart showing growth over time
4. **Milestone Alerts**: Celebrate round numbers (1000th member!)

### Medium-term (3-6 months)
1. **Predictive Analytics**: Forecast future growth based on trends
2. **Segmentation**: Break down stats by multiple dimensions
3. **A/B Testing**: Test different counter presentations
4. **Export Capability**: Download stats as CSV/JSON

### Long-term (6+ months)
1. **Dashboard**: Dedicated analytics page for organizers
2. **ML-based Insights**: Identify signup patterns and anomalies
3. **Integration**: Connect with email marketing tools
4. **API Platform**: Expose stats for third-party use

## Implementation Checklist

### Pre-Implementation
- [ ] Backup current codebase
- [ ] Audit all pages using mock data
- [ ] Test with production data locally
- [ ] Set up performance monitoring

### Implementation
- [ ] Create memberStats utility module
- [ ] Add caching layer
- [ ] Update feed.astro
- [ ] Update all variant pages
- [ ] Update supporters pages
- [ ] Add build script for stats generation
- [ ] Configure GitHub Actions (if using webhook strategy)
- [ ] Add API route (if using hybrid approach)

### Post-Implementation
- [ ] Monitor build times for 1 week
- [ ] Check data accuracy
- [ ] Gather user feedback
- [ ] Optimize based on metrics
- [ ] Document for team

## Conclusion

This implementation will transform the STA website from displaying static mock numbers to showing real, dynamic member statistics. The multi-tier caching approach ensures optimal performance while maintaining data freshness. Starting with the simple build-time computation and progressively enhancing with API updates provides a robust, scalable solution that can grow with the campaign's success.

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-08-20 | Initial PRD with comprehensive caching strategies | Claude Code |