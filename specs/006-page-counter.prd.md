# Product Requirements Document: Lightweight Page Counter
## Document Version: 2.0
## Date: 2025-08-27
## Feature ID: 006-page-counter
## Revision: Added Vercel Edge Config as primary recommendation

---

## 1. Executive Summary

Implementation of an ultra-lightweight page view counter for the Swanage Traffic Alliance website, optimized for Astro's static site generation with Decap CMS integration. The solution prioritizes ease of deployment, minimal infrastructure requirements, and robust operation over complex analytics features.

## 2. Problem Statement

### Current State
- No visitor tracking or page view metrics
- Unable to demonstrate site engagement to stakeholders
- Missing social proof elements that could strengthen activism messaging
- No data on content popularity to inform future content strategy

### Business Need
- Show site traffic to demonstrate community engagement
- Provide simple metrics for grant applications and council meetings
- Build trust through transparency of visitor numbers
- Minimal DevOps overhead for volunteer-run organization

## 3. Requirements

### 3.1 Phase 1 - MVP (Simple Page Counter)

#### Functional Requirements
- Display total page views across entire site
- Update counter on each page load
- Persist count between deployments
- Show counter in footer or dedicated component

#### Technical Requirements
- **Storage**: Edge Config (Vercel), KV stores (Cloudflare D1, Vercel KV), or similar edge storage
- **Update Method**: Edge function increment on page request
- **Display**: Astro component with server-side rendering
- **Caching**: 1-minute cache to balance real-time updates with performance
- **No cookies or client tracking** (GDPR compliant by design)

#### Design Requirements
- Brutalist aesthetic matching site design
- Bold number display with "VIEWS" label
- Optional animation on number change
- Mobile-responsive layout

### 3.2 Phase 2 - Enhanced Metrics (Future)

#### Potential Enhancements
- Per-page view counts
- Daily/weekly/monthly aggregates  
- Unique visitor approximation (using hashed IPs)
- Popular pages widget
- Time-based trend visualization

### 3.3 Phase 3 - Advanced Analytics (Future)

#### Potential Features
- Geographic distribution (country-level)
- Referrer tracking
- Session duration estimates
- Content engagement metrics
- Export capabilities for reporting

## 4. Implementation Strategy

### 4.1 MVP Implementation (Phase 1)

#### Option A: Vercel Edge Config (Primary Recommendation for Vercel Deployments)
```javascript
// api/counter.js - Vercel Edge Function with Edge Config
import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Read current count from Edge Config
  const currentCount = (await get('page_views')) || 0;
  
  // Increment count (note: requires Edge Config API for writes)
  const newCount = currentCount + 1;
  
  // Update Edge Config via API (requires VERCEL_TEAM_ID and auth token)
  if (process.env.EDGE_CONFIG_TOKEN) {
    await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'page_views',
            value: newCount,
          },
        ],
      }),
    });
  }
  
  return new Response(JSON.stringify({ count: newCount }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
```

**Benefits of Edge Config:**
- Ultra-low latency reads (< 10ms globally)
- No database setup required
- Built into Vercel platform
- Automatic global replication
- Simple key-value storage perfect for counters

#### ⚠️ WARNING: Why NOT to Use Decap CMS for Automatic Counting

**Critical Issues with Git-Based Storage:**
- **Commit Explosion**: Every page view = 1 git commit (1000 visitors = 1000 commits)
- **GitHub API Rate Limits**: 5000 requests/hour limit hit within hours
- **Build Pipeline Abuse**: Each commit triggers rebuild, exhausting free tier in <1 day
- **Race Conditions**: Concurrent visitors create merge conflicts
- **Performance**: Git operations take 1-3 seconds, causing slow page loads
- **Repository Bloat**: Git history becomes unusable

**Decap CMS Role (Manual Operations Only):**
Decap CMS should ONLY be used for:
- Manual counter resets/adjustments
- Viewing aggregated statistics (fetched from edge storage)
- Configuration management
- Historical milestone tracking

```yaml
# src/content/metrics/counter-config.yml - CONFIGURATION ONLY
page_views_offset: 10000  # Manual adjustment, added to actual count
last_reset: '2024-01-15T10:30:00Z'
counter_enabled: true
```

#### Option B: Cloudflare Workers + D1 (Best for Cloudflare Deployments)
```javascript
// Cloudflare Worker with D1 database
export default {
  async fetch(request, env) {
    const count = await env.DB.prepare(
      "UPDATE counters SET views = views + 1 WHERE id = 1 RETURNING views"
    ).first();
    
    return new Response(JSON.stringify(count), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60'
      }
    });
  }
}
```

#### Option C: External Counter Services
- CountAPI.xyz (free, simple, no setup)
- Plausible Analytics (privacy-focused)
- Simple Analytics (GDPR compliant)

### 4.2 Astro Component Integration

```astro
---
// src/components/PageCounter.astro

// For Vercel Edge Config (direct read for display only)
import { get } from '@vercel/edge-config';
const count = (await get('page_views')) || 0;

// OR for API-based approach (triggers increment)
// const response = await fetch(import.meta.env.COUNTER_API_URL);
// const { count } = await response.json();

const formattedCount = new Intl.NumberFormat('en-GB').format(count);
---

<div class="counter-block">
  <span class="counter-number" data-count={count}>{formattedCount}</span>
  <span class="counter-label">VIEWS</span>
</div>

<style>
  .counter-block {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 1rem;
    border: 4px solid var(--brutal-black);
    background: var(--brutal-white);
    box-shadow: 8px 8px 0 var(--brutal-shadow);
  }
  
  .counter-number {
    font-family: 'Arial Black', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-weight: 900;
    color: var(--brutal-red);
  }
  
  .counter-label {
    font-family: 'Arial Black', sans-serif;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
</style>
```

## 5. Deployment Architecture

### Recommended Stack Options (Phase 1)

#### Option 1: Vercel Deployment (Recommended)
1. **Vercel** for Astro hosting
2. **Vercel Edge Config** for counter storage
3. **Vercel Edge Functions** for counter API
4. **Decap CMS** for manual counter management ONLY (backup/reset/config)

#### Option 2: Cloudflare Deployment
1. **Cloudflare Pages** for Astro hosting
2. **Cloudflare Workers** for counter API
3. **Cloudflare D1** for data persistence
4. **Decap CMS** for manual counter management ONLY (backup/reset/config)

### Benefits (Both Platforms)
- Single vendor reduces complexity
- Free tier sufficient for activism site
- Built-in DDoS protection
- Global edge network for performance
- Zero cold starts
- Vercel Edge Config: Ultra-fast reads, no DB setup
- Cloudflare D1: Full SQL capabilities if needed later

## 6. Privacy & Compliance

### GDPR Compliance
- No personal data collection
- No cookies or local storage
- No IP address logging
- Anonymous aggregated metrics only
- No third-party tracking scripts

### Transparency
- Public counter visible to all visitors
- Option to display "Privacy-First Analytics" badge
- Link to privacy policy explaining minimal tracking

## 7. Performance Considerations

### Caching Strategy
- Counter API: 60-second cache at edge
- Component rendering: SSG with ISR (5 minutes)
- Client-side updates: Optional WebSocket for real-time

### Load Impact
- Edge function: <10ms latency
- No JavaScript required for basic display
- Progressive enhancement for animations
- Total overhead: <5KB

## 8. Migration Path

### Phase 1 → Phase 2
1. Extend D1 schema for per-page tracking
2. Add new API endpoints for metrics
3. Create dashboard component
4. No breaking changes to Phase 1

### Phase 2 → Phase 3
1. Implement worker analytics
2. Add geographic detection
3. Build export functionality
4. Maintain backward compatibility

## 9. Success Metrics

### Phase 1 Success Criteria
- Counter functional within 1 week of development
- Zero maintenance for 6 months
- Page load impact <50ms
- 99.9% uptime
- Cost <£5/month

### KPIs
- Implementation time: <8 hours
- Lines of code: <200
- Dependencies: 0 (uses platform features)
- Time to first byte: <100ms globally

## 10. Alternative Approaches Considered

### Rejected: Google Analytics
- Privacy concerns
- Overkill for simple counting
- Requires cookie consent
- Complex GDPR compliance

### Rejected: Self-hosted database
- Requires server maintenance
- Higher costs
- Complex deployment
- Scaling challenges

### ❌ STRONGLY REJECTED: Git-Based Storage via Decap CMS
**Why this approach fails catastrophically:**

1. **Scale Problem**: 
   - 1 visitor = 1 commit
   - 1,000 daily visitors = 1,000 commits/day = 365,000 commits/year
   - Repository becomes completely unusable

2. **Performance Impact**:
   - Git operations: 1-3 seconds per update
   - Network round trip to GitHub API
   - File read/write/commit cycle
   - Result: 3+ second page load times

3. **Technical Failures**:
   - GitHub API rate limit: 5,000/hour (hit in hours)
   - Merge conflicts from concurrent visitors
   - Build pipeline exhaustion (300 minutes/month gone in <1 day)
   - Repository size explosion

4. **Cost Implications**:
   - Continuous rebuilds exhaust free tiers
   - Required upgrade to enterprise plans
   - Estimated cost: $500+/month vs $0 for edge functions

5. **Engineering Malpractice**:
   - Violates separation of concerns
   - Abuses version control system
   - Creates unmaintainable codebase
   - Destroys git history utility

**Correct Use of Decap CMS**: Manual adjustments and configuration only, never for automatic high-frequency updates.

## 11. Implementation Checklist

### Phase 1 Launch

#### For Vercel Deployment:
- [ ] Set up Vercel project
- [ ] Create Edge Config store in Vercel dashboard
- [ ] Initialize `page_views` key in Edge Config
- [ ] Set up Edge Config environment variables (EDGE_CONFIG, EDGE_CONFIG_ID, EDGE_CONFIG_TOKEN)
- [ ] Deploy Edge Function for counter API
- [ ] Build Astro PageCounter component
- [ ] Add to site footer
- [ ] Test increment functionality
- [ ] Verify caching headers
- [ ] Update privacy policy
- [ ] Document API endpoints
- [ ] Create MANUAL reset/config workflow in Decap CMS (no automatic updates)

#### For Cloudflare Deployment:
- [ ] Set up Cloudflare account
- [ ] Deploy D1 database with counter table
- [ ] Create Workers counter API
- [ ] Build Astro PageCounter component
- [ ] Add to site footer
- [ ] Test increment functionality
- [ ] Verify caching headers
- [ ] Update privacy policy
- [ ] Document API endpoints
- [ ] Create MANUAL reset/config workflow in Decap CMS (no automatic updates)

## 12. Future Considerations

### Potential Enhancements
- **Social Proof**: "Join 10,000+ concerned residents"
- **Milestone Alerts**: Celebrate round numbers
- **Trend Indicators**: "↑ 25% this week"
- **Heat Maps**: Most visited pages/sections
- **Campaign Tracking**: Measure specific action impacts

### Technical Evolution
- **Phase 1**: Simple counter (2024 Q1)
- **Phase 2**: Basic analytics (2024 Q3)
- **Phase 3**: Full insights platform (2025)

## Appendix A: Code Examples

### Complete Vercel Edge Config Implementation

#### 1. Edge Function (api/counter.js)
```javascript
import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // Read current count
    const currentCount = (await get('page_views')) || 0;
    
    // For read-only endpoint (just display)
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ count: currentCount }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }
    
    // For increment endpoint (requires auth token)
    if (request.method === 'POST' && process.env.EDGE_CONFIG_TOKEN) {
      const newCount = currentCount + 1;
      
      // Update via Edge Config API
      const response = await fetch(
        `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                operation: 'upsert',
                key: 'page_views',
                value: newCount,
              },
            ],
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update counter');
      }
      
      return new Response(JSON.stringify({ count: newCount }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Counter error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

#### 2. Environment Variables (.env.prod)
```bash
# Edge Config connection string (automatically set by Vercel)
EDGE_CONFIG=https://edge-config.vercel.com/...

# For write operations (get from Vercel dashboard)
EDGE_CONFIG_ID=ecfg_xxx
EDGE_CONFIG_TOKEN=xxx

# Optional: Vercel team ID if using teams
VERCEL_TEAM_ID=team_xxx
```

#### 3. Initialize Edge Config (one-time setup)
```bash
# Using Vercel CLI
vercel env add EDGE_CONFIG_ID
vercel env add EDGE_CONFIG_TOKEN

# Or via dashboard: Settings -> Edge Config -> Create Store
# Initial value: { "page_views": 0 }
```

### Complete Cloudflare Worker Implementation
```javascript
// Cloudflare Worker with D1
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Initialize DB if needed
    if (url.pathname === '/api/counter/init') {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS counters (
          id INTEGER PRIMARY KEY,
          views INTEGER DEFAULT 0,
          updated_at TEXT
        )
      `).run();
      
      await env.DB.prepare(`
        INSERT OR IGNORE INTO counters (id, views) VALUES (1, 0)
      `).run();
      
      return new Response('Initialized', { status: 200 });
    }
    
    // Get current count
    if (url.pathname === '/api/counter') {
      const result = await env.DB.prepare(`
        UPDATE counters 
        SET views = views + 1, 
            updated_at = datetime('now') 
        WHERE id = 1 
        RETURNING views
      `).first();
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### Astro Integration
```astro
---
// src/pages/index.astro
import PageCounter from '../components/PageCounter.astro';
---

<footer>
  <PageCounter />
</footer>
```

## Appendix B: Decap CMS Configuration

```yaml
# IMPORTANT: For manual management ONLY - NOT for automatic counting
# Automatic updates via Decap CMS would create thousands of commits
collections:
  - name: "metrics"
    label: "Site Metrics"
    files:
      - name: "counter_config"  # Note: _config suffix to clarify purpose
        label: "Page Counter Configuration"
        file: "src/content/metrics/counter-config.json"
        fields:
          - { label: "Views Offset", name: "views_offset", widget: "number", hint: "Manual adjustment to add to actual count" }
          - { label: "Last Reset", name: "last_reset", widget: "datetime" }
          - { label: "Counter Enabled", name: "enabled", widget: "boolean" }
          - { label: "Notes", name: "notes", widget: "text", required: false, hint: "Document reason for manual adjustments" }
```

---

*End of PRD Document*