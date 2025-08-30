# PRD: Hybrid Neon Data Source Migration

**Document Version:** 1.0  
**Date:** August 30, 2025  
**Status:** Planning Phase

## Executive Summary

Migrate the Swanage Traffic Alliance website from file-based data storage (GitHub repository files + Vercel Edge Config) to a hybrid architecture using Vercel Neon PostgreSQL for leads and page counts while maintaining performance and reliability.

## Problem Statement

### Current Issues

1. **Leads Management Performance**
   - Currently stores leads as markdown files in GitHub repository (`src/content/leads/`)
   - Slow lead count queries requiring file system iteration
   - No efficient aggregation capabilities for statistics
   - GitHub API rate limits affecting lead submission reliability

2. **Page Counter Limitations** 
   - Uses Vercel Edge Config which has limited query capabilities
   - No historical tracking or analytics potential
   - Single counter value without metadata

3. **Scalability Concerns**
   - File-based storage doesn't scale with growing membership
   - Cache invalidation complexity increases with more data
   - No efficient filtering/search capabilities

## Requirements

### User Requirements

- **Fast Lead Counts**: Total lead count must load in <200ms
- **Reliable Submissions**: Lead form submissions must succeed >99.9% of the time
- **Real-time Statistics**: Member statistics should update within 5 minutes
- **Zero Downtime**: Migration must not affect website availability

### Technical Requirements

- **Database**: Vercel Neon PostgreSQL serverless instance
- **Connection**: Use `@neondatabase/serverless` driver (already installed)
- **Migration**: Preserve all existing lead data during transition
- **Fallback**: Graceful degradation if database unavailable
- **Performance**: Lead count queries <100ms, submissions <500ms

### Design Requirements

- **Backward Compatibility**: Existing API endpoints maintain same interface
- **Data Integrity**: All existing lead data preserved with same schema
- **Security**: Environment variables for database connection
- **Monitoring**: Database query logging and error tracking

## Current Data Architecture Analysis

### Leads Data (Current State)
- **Storage**: Markdown files in `src/content/leads/` via GitHub API
- **Schema**: Defined in `src/content/config.ts:24-39`
- **API**: `src/pages/api/submit-lead.ts` handles submissions
- **Statistics**: `src/utils/memberStats.ts` computes aggregations with 5min cache
- **Count**: ~Unknown total leads (requires collection query)

### Page Counter Data (Current State)  
- **Storage**: Vercel Edge Config (`page_views` key)
- **API**: `src/pages/api/counter.ts` handles read/increment
- **Performance**: ~60s cache headers, direct Edge Config access

## Implementation Notes

### Database Schema

```sql
-- Leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  submission_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  visitor_type VARCHAR(20) DEFAULT 'Local' CHECK (visitor_type IN ('Local', 'Visitor', 'Tourist', 'Other')),
  comments TEXT,
  referral_code VARCHAR(100),
  source VARCHAR(50) DEFAULT 'signup_form',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views table (replaces Edge Config)
CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_timestamp ON leads(timestamp);
CREATE INDEX idx_leads_visitor_type ON leads(visitor_type);
CREATE INDEX idx_leads_published ON leads(published);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

### Migration Strategy

1. **Phase 1: Database Setup**
   - Create Neon database instance
   - Configure connection string in `.env`
   - Create tables with proper indexes

2. **Phase 2: Data Migration**
   - Export all existing leads from `src/content/leads/` collection
   - Transform and import to PostgreSQL
   - Migrate current page count from Edge Config

3. **Phase 3: API Updates**
   - Update `src/pages/api/submit-lead.ts` to write to both systems (dual write)
   - Update `src/utils/memberStats.ts` to read from PostgreSQL
   - Update `src/pages/api/counter.ts` to use PostgreSQL

4. **Phase 4: Verification & Cleanup**
   - Verify data consistency between old and new systems
   - Remove GitHub file writing after confidence period
   - Remove Edge Config dependency

### Code Examples

```typescript
// Database connection utility
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getLeadCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM leads 
    WHERE published = true
  `;
  return parseInt(result[0].count);
}

export async function createLead(lead: LeadData): Promise<string> {
  const result = await sql`
    INSERT INTO leads (
      timestamp, user_id, submission_id, first_name, last_name, 
      name, email, visitor_type, comments, referral_code, source
    ) VALUES (
      ${lead.timestamp}, ${lead.user_id}, ${lead.submission_id},
      ${lead.first_name}, ${lead.last_name}, ${lead.name},
      ${lead.email}, ${lead.visitor_type}, ${lead.comments},
      ${lead.referral_code}, ${lead.source}
    )
    RETURNING id
  `;
  return result[0].id;
}
```

### Environment Configuration

```env
# Existing GitHub configuration (keep during transition)
OAUTH_GITHUB_CLIENT_ID=placeholder_client_id_update_me
OAUTH_GITHUB_CLIENT_SECRET=placeholder_secret_update_me
PUBLIC_DECAP_CMS_SRC_URL=/admin/decap-cms.js

# New Neon database configuration
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
NEON_DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## Responsive Design

No UI changes required - this is a backend data migration maintaining existing API interfaces.

## Animation Specifications

Not applicable - backend data migration only.

## Success Metrics

### Performance Targets
- Lead count queries: <100ms (vs current ~2000ms with file iteration)
- Lead submissions: <500ms (vs current ~1500ms GitHub API)
- Member statistics: <300ms (vs current ~800ms with caching)

### Reliability Targets  
- Lead submission success rate: >99.9%
- Database connection uptime: >99.95%
- Zero data loss during migration

### Migration Success Criteria
- All existing leads preserved (100% data integrity)
- No API interface changes (backward compatibility)
- Performance improvements achieved
- Graceful fallback functionality working