# Product Requirements Document: Per-Page Analytics with Unique Daily Views
## Document Version: 2.0
## Date: 2025-08-27
## Feature ID: 007-unique-daily-page-views
## Revision: Added per-page tracking and updated for current implementation

---

## 1. Executive Summary

Extension of the existing global page counter to support per-page analytics and unique daily visitor tracking. The system provides both site-wide and page-specific metrics while maintaining privacy through hashed identifiers and automatic daily resets. Implementation is phased with per-page tracking first, followed by unique visitor detection.

## 2. Problem Statement

### Current State (As Implemented)
- Global page counter using Vercel Edge Config
- Counter component in footer showing total views
- API endpoint at `/api/counter.js` with read/increment actions
- Environment variables configured for Edge Config access
- No per-page tracking or unique visitor detection

### Business Need
- Track individual page popularity for content optimization
- Accurate daily unique visitor metrics for stakeholder reports
- Better understanding of actual reach vs raw page views
- Maintain GDPR compliance with no personal data storage
- Minimal additional infrastructure complexity

## 3. Implementation Roadmap & Complexity

### Phase 1: Per-Page Tracking (LOW COMPLEXITY - 3-4 hours)
**Objective**: Track views for individual pages/routes

**Features**:
- Separate counters for each page
- Pass page identifier from component to API
- Store per-page counts in Edge Config
- Display page-specific counts

**Complexity**: ⭐⭐☆☆☆ (2/5)
- Simple extension of existing structure
- No new dependencies
- Minimal API changes

### Phase 2: Unique Daily Visitors (MEDIUM COMPLEXITY - 6-8 hours)
**Objective**: Count unique visitors per day

**Features**:
- Hash-based visitor identification
- Daily automatic reset at midnight UTC
- Store visitor hashes in Edge Config
- Display unique vs total counts

**Complexity**: ⭐⭐⭐⭐☆ (4/5)
- Requires crypto for hashing
- Storage size management
- Daily reset logic
- More complex data structure

## 4. Requirements

### 4.1 Functional Requirements

#### Phase 1 Features (Per-Page)
- Track views for each unique page path
- Support both global and page-specific counters
- Maintain backward compatibility with global counter
- Real-time updates across all deployments

#### Phase 2 Features (Unique Visitors)
- Track unique visitors per calendar day (UTC)
- Display both total views and unique daily visitors
- Automatic daily reset at midnight UTC
- No cookies or local storage required
- Privacy-first design with hashed identifiers

### 3.2 Technical Requirements

#### Privacy Compliance
- **No PII storage**: Only store hashed identifiers
- **No cookies**: Use edge-computed hashes
- **Auto-cleanup**: Daily automatic data purge
- **GDPR compliant**: No consent required

#### Performance Targets
- <20ms latency for uniqueness check
- <50KB daily storage per 1000 visitors
- Zero impact on page load time
- Automatic cleanup without manual intervention

## 5. Data Structure Design

### 5.1 Phase 1: Per-Page Tracking Structure

```javascript
// Edge Config structure with per-page tracking
{
  "page_views": 125000,           // Global total (backward compatible)
  "page_counts": {                // Per-page view counts
    "/": 45000,                   // Homepage
    "/feed": 23000,               // Feed page
    "/news": 18000,               // News page
    "/privacy": 2000,             // Privacy policy
    "/terms": 1500,               // Terms page
    // Dynamic pages
    "/news/[slug]": 15000,        // All news articles combined
    "/supporters/[page]": 20500   // All supporter pages combined
  },
  "last_updated": "2025-01-15T14:30:00Z"
}
```

### 5.2 Phase 2: Adding Unique Visitor Tracking

```javascript
// Edge Config structure with unique tracking
{
  "page_views": 125000,           // Global total
  "page_counts": { /* ... */ },   // Per-page counts from Phase 1
  
  // Global unique tracking
  "daily_unique_count": 342,      // Today's unique visitor count
  "daily_seen_hashes": [           // Today's seen visitor hashes
    "a1b2c3...",
    "d4e5f6...",
  ],
  
  // Per-page unique tracking (optional)
  "page_daily_uniques": {
    "/": { count: 145, hashes: [...] },
    "/feed": { count: 89, hashes: [...] },
    "/news": { count: 67, hashes: [...] }
  },
  
  "daily_reset_date": "2025-01-15", // Last reset date (YYYY-MM-DD UTC)
  "yesterday_unique_count": 298     // Yesterday's final count
}
```

### 4.2 Visitor Identification Strategy

```javascript
// Generate visitor hash (edge function)
function generateVisitorHash(request) {
  // Combine stable request properties
  const components = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'en',
    request.headers.get('accept-encoding') || 'gzip',
    // Use CF-Connecting-IP or X-Forwarded-For, hash it immediately
    hashIP(request.headers.get('cf-connecting-ip') || 
           request.headers.get('x-forwarded-for') || 
           'unknown')
  ];
  
  // Create hash (first 16 chars for storage efficiency)
  return sha256(components.join('|')).substring(0, 16);
}

// Hash IP immediately, never store raw IP
function hashIP(ip) {
  return sha256(ip + DAILY_SALT).substring(0, 8);
}
```

### 4.3 Daily Reset Logic

```javascript
// Check and perform daily reset
async function checkDailyReset(currentConfig) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (currentConfig.daily_reset_date !== today) {
    return {
      page_views: currentConfig.page_views,
      daily_unique_count: 0,
      daily_seen_hashes: [],
      daily_reset_date: today,
      yesterday_unique_count: currentConfig.daily_unique_count
    };
  }
  
  return currentConfig;
}
```

## 6. Implementation Steps

### 6.1 Phase 1: Per-Page Tracking Implementation

#### Step 1: Update API Endpoint (1 hour)
```javascript
// api/counter.js modifications
export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "read";
  const page = searchParams.get("page") || "global"; // New parameter
  
  // Get current config
  const config = await getAll() || { 
    page_views: 0,
    page_counts: {}
  };
  
  if (action === "increment") {
    // Increment global counter
    config.page_views = (config.page_views || 0) + 1;
    
    // Increment page-specific counter
    if (page !== "global") {
      config.page_counts = config.page_counts || {};
      config.page_counts[page] = (config.page_counts[page] || 0) + 1;
    }
    
    // Update Edge Config
    await updateEdgeConfig(config);
  }
  
  return new Response(JSON.stringify({
    count: page === "global" ? config.page_views : config.page_counts[page] || 0,
    global_count: config.page_views,
    page_count: config.page_counts[page] || 0
  }));
}
```

#### Step 2: Update PageCounter Component (30 minutes)
```astro
---
// PageCounter.astro
export interface Props {
  page?: string;  // Optional page identifier
  showGlobal?: boolean;  // Show global count too
}

const { page = "global", showGlobal = false } = Astro.props;
const currentPath = page === "auto" ? Astro.url.pathname : page;

// Fetch counts
const response = await fetch(
  `${apiBaseUrl}/api/counter?action=read&page=${encodeURIComponent(currentPath)}`
);
const { page_count, global_count } = await response.json();
---

<div class="counter-block" data-api-url="/api/counter" data-page={currentPath}>
  {showGlobal && (
    <div class="counter-item">
      <span class="counter-number">{formatNumber(global_count)}</span>
      <span class="counter-label">TOTAL VIEWS</span>
    </div>
  )}
  {page !== "global" && (
    <div class="counter-item">
      <span class="counter-number">{formatNumber(page_count)}</span>
      <span class="counter-label">PAGE VIEWS</span>
    </div>
  )}
</div>
```

#### Step 3: Update Component Usage (30 minutes)
```astro
<!-- In Footer.astro (global counter) -->
<PageCounter page="global" />

<!-- In specific pages (per-page counter) -->
<PageCounter page="auto" showGlobal={true} />
```

#### Step 4: Testing & Verification (1 hour)
- Test global counter still works
- Verify per-page counters increment correctly
- Check Edge Config storage structure
- Validate display on mobile

### 6.2 Phase 2: Unique Visitor Implementation

#### Step 1: Add Hashing Utilities (1 hour)
```javascript
// api/counter.js - Add crypto imports
import { createHash } from 'crypto';

function generateVisitorHash(request) {
  const components = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'en',
    // Hash IP immediately for privacy
    hashIP(request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 'unknown'),
    new Date().toISOString().split('T')[0] // Include date for daily uniqueness
  ];
  
  const hash = createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
  
  return hash.substring(0, 16); // First 16 chars
}

function hashIP(ip) {
  const DAILY_SALT = 'sta-' + new Date().toISOString().split('T')[0];
  return createHash('sha256')
    .update(ip + DAILY_SALT)
    .digest('hex')
    .substring(0, 8);
}
```

#### Step 2: Add Daily Reset Logic (2 hours)
```javascript
async function checkDailyReset(config) {
  const today = new Date().toISOString().split('T')[0];
  
  if (config.daily_reset_date !== today) {
    // Preserve counts but reset unique tracking
    return {
      ...config,
      yesterday_unique_count: config.daily_unique_count || 0,
      daily_unique_count: 0,
      daily_seen_hashes: [],
      page_daily_uniques: {},
      daily_reset_date: today
    };
  }
  
  return config;
}
```

#### Step 3: Update Increment Logic (2 hours)
```javascript
// In handler function
export default async function handler(request) {
  let config = await getAll() || initialConfig();
  
  // Check for daily reset
  config = await checkDailyReset(config);
  
  if (action === "increment") {
    // Generate visitor hash
    const visitorHash = generateVisitorHash(request);
    
    // Check global uniqueness
    const isGlobalUnique = !config.daily_seen_hashes?.includes(visitorHash);
    
    if (isGlobalUnique && config.daily_seen_hashes.length < 10000) {
      config.daily_seen_hashes.push(visitorHash);
      config.daily_unique_count = (config.daily_unique_count || 0) + 1;
    }
    
    // Always increment totals
    config.page_views++;
    
    // Handle page-specific counts
    if (page !== "global") {
      config.page_counts[page] = (config.page_counts[page] || 0) + 1;
      
      // Track page-specific uniques (optional)
      if (trackPageUniques) {
        config.page_daily_uniques = config.page_daily_uniques || {};
        const pageData = config.page_daily_uniques[page] || { count: 0, hashes: [] };
        
        if (!pageData.hashes.includes(visitorHash) && pageData.hashes.length < 1000) {
          pageData.hashes.push(visitorHash);
          pageData.count++;
        }
        
        config.page_daily_uniques[page] = pageData;
      }
    }
    
    await updateEdgeConfig(config);
  }
  
  return new Response(JSON.stringify({
    total_views: config.page_views,
    unique_today: config.daily_unique_count,
    is_unique: isGlobalUnique,
    page_count: config.page_counts[page] || 0
  }));
}
```

#### Step 4: Update Display Component (1 hour)
```astro
---
// PageCounter.astro with unique display
const response = await fetch(`${apiBaseUrl}/api/counter?action=read&page=${currentPath}`);
const { total_views, unique_today, page_count } = await response.json();
---

<div class="counter-block">
  <div class="counter-item">
    <span class="counter-number">{formatNumber(unique_today)}</span>
    <span class="counter-label">UNIQUE TODAY</span>
  </div>
  <div class="counter-item">
    <span class="counter-number">{formatNumber(total_views)}</span>
    <span class="counter-label">TOTAL VIEWS</span>
  </div>
</div>
```

## 7. Complexity Breakdown

### Phase 1: Per-Page Tracking
| Task | Complexity | Time | Risk |
|------|------------|------|------|
| API endpoint update | Low | 1 hour | Minimal - extends existing code |
| Component props | Low | 30 min | None - backward compatible |
| Page integration | Low | 30 min | None - optional feature |
| Testing | Low | 1 hour | None - easy to verify |
| **Total** | **Low** | **3 hours** | **Low risk** |

### Phase 2: Unique Visitors
| Task | Complexity | Time | Risk |
|------|------------|------|------|
| Crypto/hashing setup | Medium | 1 hour | Edge runtime compatibility |
| Daily reset logic | Medium | 2 hours | Timezone handling |
| Uniqueness checking | High | 2 hours | Storage size limits |
| Display updates | Low | 1 hour | None |
| Testing & debugging | Medium | 2 hours | Edge cases, scale |
| **Total** | **Medium-High** | **8 hours** | **Medium risk** |

### Storage Considerations
```javascript
// Storage size estimates
const estimates = {
  // Phase 1: Per-page counters
  perPageStorage: {
    pages: 20,           // Number of tracked pages
    bytesPerPage: 50,    // Path + count
    total: "~1KB"        // Negligible
  },
  
  // Phase 2: Unique tracking
  uniqueStorage: {
    hashSize: 16,        // Bytes per hash
    maxDaily: 10000,     // Max unique visitors
    total: "~160KB",     // Maximum daily storage
    withPages: "~320KB"  // If tracking per-page uniques
  }
};
```

## 8. Migration & Rollback Plan

### Phase 1 Migration
1. Deploy new API with page parameter (backward compatible)
2. Update components gradually (old ones still work)
3. Monitor Edge Config storage usage
4. No rollback needed - fully backward compatible

### Phase 2 Migration  
1. Deploy with feature flag: `ENABLE_UNIQUE_TRACKING=false`
2. Test with subset of traffic first
3. Monitor storage and performance
4. Enable gradually: 10% → 50% → 100%
5. Rollback: Simply disable feature flag

## 9. Testing Strategy

### Phase 1 Test Cases
```javascript
// Test per-page counting
describe('Per-Page Tracking', () => {
  it('should track homepage separately', async () => {
    await fetch('/api/counter?action=increment&page=/');
    const res = await fetch('/api/counter?action=read&page=/');
    expect(res.page_count).toBeGreaterThan(0);
  });
  
  it('should maintain global count', async () => {
    const before = await getGlobalCount();
    await fetch('/api/counter?action=increment&page=/feed');
    const after = await getGlobalCount();
    expect(after).toBe(before + 1);
  });
});
```

### Phase 2 Test Cases
```javascript
describe('Unique Visitor Tracking', () => {
  it('should count first visit as unique', async () => {
    const res = await fetch('/api/counter?action=increment');
    expect(res.is_unique).toBe(true);
  });
  
  it('should not count repeat visits', async () => {
    await fetch('/api/counter?action=increment');
    const res = await fetch('/api/counter?action=increment');
    expect(res.is_unique).toBe(false);
  });
  
  it('should reset at midnight UTC', async () => {
    // Set date to 23:59:59 UTC
    await fetch('/api/counter?action=increment');
    
    // Set date to 00:00:01 UTC next day
    const res = await fetch('/api/counter?action=increment');
    expect(res.is_unique).toBe(true);
  });
});
```

## 10. Implementation Checklist

### Phase 1: Per-Page Tracking
- [ ] Update API to accept page parameter
- [ ] Extend Edge Config structure for page_counts
- [ ] Update PageCounter component with page prop
- [ ] Test backward compatibility
- [ ] Deploy to production
- [ ] Monitor storage usage

### Phase 2: Unique Visitors
- [ ] Add crypto imports for hashing
- [ ] Implement visitor hash generation
- [ ] Add daily reset logic
- [ ] Update API with uniqueness checking
- [ ] Modify display components
- [ ] Add feature flag for gradual rollout
- [ ] Test midnight UTC reset
- [ ] Update privacy policy
- [ ] Monitor storage limits

## 11. Conclusion

This phased approach allows for incremental feature deployment with minimal risk:

**Phase 1 (Per-Page)**: Simple, low-risk extension that provides immediate value with page-level insights.

**Phase 2 (Unique Visitors)**: More complex but provides crucial metrics about actual reach versus raw traffic.

Both phases maintain backward compatibility and can be rolled back independently if needed. The architecture supports future enhancements while keeping the current implementation simple and maintainable.
- For analytics depth: Consider dedicated analytics service

## Appendix A: Implementation Code

### Complete Edge Function
```javascript
import { get, getAll } from '@vercel/edge-config';
import { sha256 } from 'crypto';

const MAX_DAILY_HASHES = 10000;
const DAILY_SALT = 'sta-2025'; // Change periodically for privacy

export default async function handler(request) {
  try {
    // Get current configuration
    let config = await getAll() || {
      page_views: 0,
      daily_unique_count: 0,
      daily_seen_hashes: [],
      daily_reset_date: null,
      yesterday_unique_count: 0
    };
    
    // Check for daily reset
    const today = new Date().toISOString().split('T')[0];
    if (config.daily_reset_date !== today) {
      config = {
        ...config,
        yesterday_unique_count: config.daily_unique_count,
        daily_unique_count: 0,
        daily_seen_hashes: [],
        daily_reset_date: today
      };
    }
    
    // Generate visitor hash
    const visitorHash = generateVisitorHash(request);
    
    // Check uniqueness
    const isUnique = !config.daily_seen_hashes.includes(visitorHash);
    
    // Update counts
    if (isUnique && config.daily_seen_hashes.length < MAX_DAILY_HASHES) {
      config.daily_seen_hashes.push(visitorHash);
      config.daily_unique_count++;
    }
    
    config.page_views++;
    
    // Save to Edge Config
    await updateEdgeConfig(config);
    
    return new Response(JSON.stringify({
      total_views: config.page_views,
      unique_today: config.daily_unique_count,
      yesterday_unique: config.yesterday_unique_count,
      is_unique: isUnique
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Counter error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500
    });
  }
}

function generateVisitorHash(request) {
  const components = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'en',
    hashIP(request.headers.get('cf-connecting-ip') || 'unknown'),
    new Date().toISOString().split('T')[0] // Include date for daily uniqueness
  ];
  
  return sha256(components.join('|')).substring(0, 16);
}

function hashIP(ip) {
  return sha256(ip + DAILY_SALT).substring(0, 8);
}
```

---

*End of PRD Document*