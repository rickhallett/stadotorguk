# Product Requirements Document: Redis Caching Infrastructure

## Executive Summary

This PRD evaluates the implementation of Redis as a distributed caching layer for the Swanage Traffic Alliance (STA) website. Based on deep analysis, Redis would add **MODERATE TO HIGH complexity** (7/10) for a site currently using static generation with mock data. The recommendation is to defer Redis implementation until the site has transitioned to dynamic backend services and experiences significant traffic that justifies the operational overhead.

## Problem Statement

### Current State Analysis
1. **Static Site Architecture**: Site built with Astro using SSG (Static Site Generation)
2. **Mock Data Usage**: Currently using hardcoded arrays in frontmatter
3. **Limited Dynamic Content**: No real-time features requiring distributed caching
4. **Build-Time Processing**: Data fetching happens during build, not runtime
5. **Existing Caching PRD**: Already has member-counts caching solution using file-based approach

### Potential Future Problems
1. **Scale Issues**: When traffic grows to 10,000+ concurrent users
2. **Database Load**: Direct database queries for every page view
3. **API Rate Limits**: Third-party service restrictions
4. **Session Management**: No current infrastructure for user sessions
5. **Real-time Features**: Live counters, notifications, chat features

### Complexity Assessment

| Factor | Complexity | Rationale |
|--------|-----------|-----------|
| Infrastructure Setup | 6/10 | Redis server, networking, security configuration |
| Astro Integration | 7/10 | SSG/SSR mode decisions, middleware setup |
| Operational Overhead | 8/10 | Monitoring, backups, memory management |
| Team Learning Curve | 5/10 | New technology for activism site maintainers |
| Cost-Benefit Ratio | 3/10 | Overkill for current scale and architecture |
| **Overall Complexity** | **7/10** | **Moderate to High** |

## Requirements

### Functional Requirements

#### What Redis Would Cache
```typescript
interface CacheableData {
  // User-generated content
  feedComments: Comment[];           // Community voices
  supporterSignups: Lead[];          // Recent signups
  
  // Computed statistics
  memberStats: {
    total: number;
    byType: Record<string, number>;
    growth: GrowthMetrics;
  };
  
  // External API responses
  trafficData: {
    current: TrafficSnapshot;
    historical: TrafficTrend[];
  };
  
  // Session data
  userSessions: {
    id: string;
    data: SessionData;
    expires: number;
  };
  
  // Rate limiting
  rateLimits: {
    ip: string;
    endpoint: string;
    count: number;
    window: number;
  };
  
  // Form submissions
  pendingSubmissions: {
    form: string;
    data: FormData;
    status: 'pending' | 'processing' | 'complete';
  };
}
```

### Technical Requirements

#### Deployment Environments
1. **Development**: Local Redis via Docker
2. **Staging**: Managed Redis (e.g., Upstash, Redis Cloud free tier)
3. **Production**: High-availability Redis cluster or managed service

#### Integration Points
1. **Astro SSR Mode**: Required for runtime caching benefits
2. **API Endpoints**: `/api/stats`, `/api/feed`, `/api/submit`
3. **Middleware Layer**: Request/response caching
4. **Background Jobs**: Cache warming, invalidation

## Implementation Architecture

### Prerequisites Check
```typescript
// src/utils/prerequisites.ts
export function checkRedisReadiness(): ReadinessReport {
  return {
    hasBackend: false,              // ❌ Currently using mock data
    hasDatabase: false,             // ❌ No database connection
    hasUserAuth: false,             // ❌ No authentication system
    trafficVolume: 'low',           // ❌ < 1000 daily visitors
    dynamicContent: 'minimal',      // ❌ Mostly static pages
    recommendRedis: false,          // ❌ Not yet needed
    
    alternativeSolutions: [
      'CDN caching (Cloudflare)',
      'Browser localStorage',
      'Build-time caching (current solution)',
      'Edge caching (Vercel/Netlify)',
    ],
  };
}
```

### Option 1: Simple In-Memory Cache (Recommended First Step)
```typescript
// src/utils/simpleCache.ts
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl: number = 300): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000),
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
```

### Option 2: Redis Integration (When Ready)

#### Installation & Setup
```bash
# 1. Install dependencies
npm install redis @types/redis

# 2. Docker setup for development
docker run -d \
  --name sta-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes

# 3. Environment configuration
echo "REDIS_URL=redis://localhost:6379" >> .env
```

#### Redis Client Configuration
```typescript
// src/lib/redis.ts
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redis: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // Only use Redis in SSR mode or API routes
  if (import.meta.env.SSG) {
    console.warn('Redis not available in SSG mode');
    return null;
  }
  
  if (!redis) {
    const url = import.meta.env.REDIS_URL;
    if (!url) {
      console.warn('REDIS_URL not configured');
      return null;
    }
    
    redis = createClient({
      url,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return false;
          return Math.min(retries * 100, 3000);
        },
      },
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    redis.on('connect', () => {
      console.log('Redis connected');
    });
    
    await redis.connect();
  }
  
  return redis;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    if (redis) {
      await redis.quit();
    }
  });
}
```

#### Caching Middleware
```typescript
// src/middleware/cache.ts
import type { MiddlewareHandler } from 'astro';
import { getRedisClient } from '../lib/redis';

export const cacheMiddleware: MiddlewareHandler = async (context, next) => {
  // Skip caching for non-GET requests
  if (context.request.method !== 'GET') {
    return next();
  }
  
  // Skip caching for authenticated routes
  if (context.url.pathname.startsWith('/admin')) {
    return next();
  }
  
  const redis = await getRedisClient();
  if (!redis) {
    return next(); // Fallback to no caching
  }
  
  const cacheKey = `page:${context.url.pathname}${context.url.search}`;
  
  try {
    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'text/html',
          'X-Cache': 'HIT',
        },
      });
    }
    
    // Get response
    const response = await next();
    
    // Cache successful responses
    if (response.status === 200) {
      const html = await response.text();
      await redis.setex(cacheKey, 300, html); // 5 minutes TTL
      
      return new Response(html, {
        status: response.status,
        headers: {
          ...response.headers,
          'X-Cache': 'MISS',
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('Cache middleware error:', error);
    return next();
  }
};
```

#### API Route Caching
```typescript
// src/pages/api/member-stats.json.ts
import type { APIRoute } from 'astro';
import { getRedisClient } from '../../lib/redis';
import { getMemberStats } from '../../utils/memberStats';

export const GET: APIRoute = async () => {
  const redis = await getRedisClient();
  const cacheKey = 'api:member-stats';
  
  try {
    // Try cache first
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=60',
          },
        });
      }
    }
    
    // Compute fresh stats
    const stats = await getMemberStats();
    const json = JSON.stringify(stats);
    
    // Cache for 5 minutes
    if (redis) {
      await redis.setex(cacheKey, 300, json);
    }
    
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stats' }), 
      { status: 500 }
    );
  }
};
```

### Cache Invalidation Strategies

#### Pattern-Based Invalidation
```typescript
// src/utils/cacheInvalidation.ts
export class CacheInvalidator {
  constructor(private redis: RedisClientType) {}
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
  
  async invalidateFeed(): Promise<void> {
    await this.invalidatePattern('page:/feed*');
    await this.invalidatePattern('api:feed*');
  }
  
  async invalidateStats(): Promise<void> {
    await this.invalidatePattern('api:*stats*');
    await this.invalidatePattern('page:/*'); // Homepage shows stats
  }
  
  async invalidateAll(): Promise<void> {
    await this.redis.flushDb();
  }
}
```

#### Event-Driven Invalidation
```typescript
// src/events/cacheEvents.ts
import { EventEmitter } from 'events';

class CacheEventBus extends EventEmitter {
  onNewLead(): void {
    this.emit('invalidate:stats');
    this.emit('invalidate:feed');
  }
  
  onNewComment(): void {
    this.emit('invalidate:feed');
  }
  
  onContentUpdate(): void {
    this.emit('invalidate:all');
  }
}

export const cacheEvents = new CacheEventBus();

// Subscribe to events
cacheEvents.on('invalidate:stats', async () => {
  const invalidator = new CacheInvalidator(redis);
  await invalidator.invalidateStats();
});
```

## Migration Path

### Phase 0: Current State ✅
- File-based caching for member stats
- Build-time data processing
- Static HTML generation

### Phase 1: Preparation (When Backend Exists)
1. Implement database connection
2. Create API endpoints
3. Add user authentication
4. Set up monitoring

### Phase 2: Simple Caching
1. Deploy in-memory cache
2. Cache API responses
3. Monitor cache hit rates
4. Measure performance impact

### Phase 3: Redis Evaluation
1. Traffic exceeds 5,000 daily users
2. Database queries become bottleneck
3. Need for distributed caching
4. Session management required

### Phase 4: Redis Implementation (If Justified)
1. Set up Redis infrastructure
2. Migrate from in-memory to Redis
3. Implement cache warming
4. Add invalidation logic

## Performance Impact

### Without Redis (Current)
```yaml
Build Time: ~3 seconds
Page Load: < 1 second (static HTML)
API Response: N/A (no APIs)
Hosting Cost: ~$0 (static hosting)
Complexity: Low
```

### With In-Memory Cache
```yaml
Build Time: ~3 seconds
Page Load: < 1 second
API Response: ~50ms (cached), ~200ms (miss)
Hosting Cost: ~$5/month (basic VPS)
Complexity: Low-Medium
```

### With Redis
```yaml
Build Time: ~3 seconds
Page Load: < 1 second
API Response: ~20ms (cached), ~200ms (miss)
Hosting Cost: ~$25-50/month (Redis + hosting)
Complexity: Medium-High
Operational Overhead: Significant
```

## Alternative Solutions

### 1. CDN Edge Caching (Recommended)
```typescript
// Use Cloudflare or similar
export const config = {
  headers: {
    'Cache-Control': 'public, max-age=3600',
    'CDN-Cache-Control': 'max-age=86400',
  },
};
```

### 2. Browser LocalStorage
```typescript
// Client-side caching
class BrowserCache {
  set(key: string, data: any, ttl: number): void {
    localStorage.setItem(key, JSON.stringify({
      data,
      expires: Date.now() + ttl,
    }));
  }
  
  get(key: string): any | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { data, expires } = JSON.parse(item);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  }
}
```

### 3. Service Worker Caching
```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('api-cache').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

## Cost Analysis

### Redis Hosting Options

| Provider | Free Tier | Production | Features |
|----------|-----------|------------|----------|
| Upstash | 10K commands/day | $0.2/100K commands | Serverless, pay-per-use |
| Redis Cloud | 30MB | $5+/month | Managed, reliable |
| Railway | 500MB/1GB transfer | $5+/month | Simple deployment |
| Render | None | $7+/month | Auto-scaling |
| Self-hosted | N/A | VPS cost (~$5-20) | Full control, more work |

### TCO Comparison (Monthly)

| Solution | Infrastructure | Operational | Developer Time | Total |
|----------|---------------|-------------|----------------|-------|
| No Cache | $0 | $0 | 0 hours | $0 |
| CDN Cache | $0-20 | $0 | 2 hours | $200 |
| In-Memory | $5 | $0 | 5 hours | $505 |
| Redis | $25-50 | $100 | 10 hours | $1,125-1,150 |

*Developer time calculated at $100/hour

## Risk Assessment

### Technical Risks
1. **Over-engineering**: Redis adds complexity without proportional benefit
2. **Cache Stampede**: Multiple requests regenerating same expired cache
3. **Data Inconsistency**: Stale cache serving outdated information
4. **Memory Leaks**: Improper connection management
5. **Security**: Exposed Redis instance without proper authentication

### Mitigation Strategies
```typescript
// Prevent cache stampede
async function getWithLock(key: string, generator: Function) {
  const lockKey = `lock:${key}`;
  const lock = await redis.set(lockKey, '1', 'NX', 'EX', 10);
  
  if (lock) {
    const data = await generator();
    await redis.setex(key, 300, JSON.stringify(data));
    await redis.del(lockKey);
    return data;
  }
  
  // Wait for lock to release
  await new Promise(r => setTimeout(r, 100));
  return JSON.parse(await redis.get(key));
}
```

## Monitoring & Observability

### Key Metrics
```typescript
interface CacheMetrics {
  hitRate: number;           // Target: > 80%
  missRate: number;          // Target: < 20%
  evictionRate: number;      // Target: < 5%
  avgLatency: number;        // Target: < 10ms
  memoryUsage: number;       // Target: < 80% of limit
  connectionErrors: number;  // Target: 0
}
```

### Monitoring Setup
```typescript
// src/utils/cacheMonitoring.ts
export class CacheMonitor {
  private metrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    latencies: [],
  };
  
  recordHit(): void {
    this.metrics.hits++;
  }
  
  recordMiss(): void {
    this.metrics.misses++;
  }
  
  recordLatency(ms: number): void {
    this.metrics.latencies.push(ms);
    if (this.metrics.latencies.length > 1000) {
      this.metrics.latencies.shift();
    }
  }
  
  getStats(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      missRate: total > 0 ? this.metrics.misses / total : 0,
      avgLatency: this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length,
      // ... other metrics
    };
  }
}
```

## Decision Matrix

| Criteria | Weight | No Cache | CDN | In-Memory | Redis |
|----------|--------|----------|-----|-----------|--------|
| Performance | 25% | 3/5 | 4/5 | 4/5 | 5/5 |
| Complexity | 25% | 5/5 | 4/5 | 3/5 | 2/5 |
| Cost | 20% | 5/5 | 4/5 | 4/5 | 2/5 |
| Scalability | 15% | 2/5 | 5/5 | 3/5 | 5/5 |
| Maintenance | 15% | 5/5 | 4/5 | 3/5 | 2/5 |
| **Total Score** | | **3.8** | **4.2** | **3.5** | **3.3** |

**Recommendation**: CDN caching is the optimal solution for current needs

## Success Criteria

### Short-term (1 month)
- [ ] Document current caching approach
- [ ] Implement build-time cache optimization
- [ ] Set up CDN with proper cache headers
- [ ] Monitor page load performance

### Medium-term (3 months)
- [ ] Evaluate need for dynamic caching
- [ ] Implement simple in-memory cache if needed
- [ ] Add cache metrics monitoring
- [ ] Assess traffic growth patterns

### Long-term (6+ months)
- [ ] Re-evaluate Redis need based on:
  - [ ] Traffic > 10,000 daily users
  - [ ] Dynamic content > 50% of pages
  - [ ] API response times > 500ms
  - [ ] Session management requirements

## Implementation Checklist

### Pre-Redis Checklist ⚠️
- [ ] Backend API exists
- [ ] Database implemented
- [ ] Traffic exceeds 5,000 daily users
- [ ] Dynamic content requires caching
- [ ] Team comfortable with added complexity
- [ ] Budget approved for infrastructure

### Redis Implementation (When Ready)
- [ ] Choose hosting provider
- [ ] Set up development environment
- [ ] Implement Redis client
- [ ] Add caching middleware
- [ ] Create invalidation strategies
- [ ] Set up monitoring
- [ ] Document runbooks
- [ ] Train team on Redis operations

## Conclusion

**Redis is not recommended for the current state of the STA website**. The site should continue using build-time caching and CDN strategies until it has:

1. Transitioned from mock data to real backend
2. Implemented user authentication
3. Grown to 5,000+ daily active users
4. Added real-time features requiring distributed state

The complexity cost (7/10) significantly outweighs the current benefits. Focus should remain on:
- Optimizing existing file-based caching
- Implementing CDN caching
- Preparing backend infrastructure
- Growing user base

Redis should be reconsidered only when the site's architecture and scale justify the operational overhead.

## Appendix: Quick Start Commands

```bash
# When you're ready for Redis (not now):

# 1. Local development
docker-compose up -d redis

# 2. Connect to Redis CLI
docker exec -it sta-redis redis-cli

# 3. Basic commands
SET key "value"
GET key
EXPIRE key 300
DEL key
FLUSHDB

# 4. Monitor performance
redis-cli --stat
redis-cli monitor

# 5. Backup
docker exec sta-redis redis-cli BGSAVE
```

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-20 | Claude Code | Initial PRD with complexity assessment |

---

*This PRD was generated after deep analysis using sequential thinking to evaluate all aspects of Redis implementation for the STA website.*