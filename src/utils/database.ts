import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

export interface LeadData {
  timestamp: string | Date;
  user_id: string;
  submission_id: string;
  first_name: string;
  last_name?: string;
  name: string;
  email: string;
  visitor_type?: 'Local' | 'Visitor' | 'Tourist' | 'Other';
  comments?: string;
  referral_code?: string;
  source?: string;
  published?: boolean;
}

export interface Lead extends LeadData {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface MemberStatsByType {
  Local: number;
  Visitor: number;
  Tourist: number;
  Other: number;
}

export interface DatabaseMemberStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: MemberStatsByType;
  growth: {
    dailyAverage: number;
    weeklyGrowth: number;
    trend: 'up' | 'down' | 'stable';
  };
  lastUpdated: string;
}

// Lead operations
export async function getLeadCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE published = true
    `;
    return parseInt(result[0].count as string);
  } catch (error) {
    console.error('Failed to get lead count:', error);
    throw error;
  }
}

export async function createLead(lead: LeadData): Promise<number> {
  try {
    const result = await sql`
      INSERT INTO leads (
        timestamp, user_id, submission_id, first_name, last_name, 
        name, email, visitor_type, comments, referral_code, source, published
      ) VALUES (
        ${lead.timestamp}, ${lead.user_id}, ${lead.submission_id},
        ${lead.first_name}, ${lead.last_name || ''}, ${lead.name},
        ${lead.email}, ${lead.visitor_type || 'Local'}, ${lead.comments || ''},
        ${lead.referral_code || ''}, ${lead.source || 'signup_form'}, ${lead.published !== false}
      )
      RETURNING id
    `;
    return result[0].id as number;
  } catch (error) {
    console.error('Failed to create lead:', error);
    throw error;
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  try {
    const result = await sql`
      SELECT * FROM leads 
      WHERE published = true
      ORDER BY timestamp DESC
    `;
    return result as Lead[];
  } catch (error) {
    console.error('Failed to get all leads:', error);
    throw error;
  }
}

export async function getLeads(limit: number, offset: number): Promise<Lead[]> {
    try {
        const result = await sql`
      SELECT * FROM leads 
      WHERE published = true AND comments IS NOT NULL AND comments != ''
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
        return result as Lead[];
    } catch (error) {
        console.error('Failed to get leads:', error);
        throw error;
    }
}

export async function getMemberStats(): Promise<DatabaseMemberStats> {
  try {
    const now = new Date();
    
    // Get all leads with time-based filtering in single query
    const result = await sql`
      WITH time_ranges AS (
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE timestamp >= ${new Date(now.getTime() - 24 * 60 * 60 * 1000)}) as today,
          COUNT(*) FILTER (WHERE timestamp >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}) as this_week,
          COUNT(*) FILTER (WHERE timestamp >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}) as this_month,
          COUNT(*) FILTER (WHERE timestamp >= ${new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)} AND timestamp < ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}) as last_week
        FROM leads
        WHERE published = true
      ),
      type_counts AS (
        SELECT
          visitor_type,
          COUNT(*) as count
        FROM leads
        WHERE published = true
        GROUP BY visitor_type
      ),
      growth_data AS (
        SELECT
          MIN(timestamp) as first_date,
          COUNT(*) as total_leads
        FROM leads
        WHERE published = true
      )
      SELECT 
        tr.*,
        COALESCE(json_object_agg(tc.visitor_type, tc.count) FILTER (WHERE tc.visitor_type IS NOT NULL), '{}') as type_counts,
        gd.first_date,
        gd.total_leads
      FROM time_ranges tr
      CROSS JOIN growth_data gd
      LEFT JOIN type_counts tc ON true
      GROUP BY tr.total, tr.today, tr.this_week, tr.this_month, tr.last_week, gd.first_date, gd.total_leads
    `;

    const data = result[0] as any;
    
    // Calculate growth metrics
    const firstDate = data.first_date ? new Date(data.first_date) : now;
    const daysSinceStart = Math.max(1, (now.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000));
    const dailyAverage = Math.round(data.total / daysSinceStart);
    
    const weeklyGrowth = data.last_week > 0 
      ? Math.round(((data.this_week - data.last_week) / data.last_week) * 100)
      : 100;
      
    const trend = weeklyGrowth > 5 ? 'up' : weeklyGrowth < -5 ? 'down' : 'stable';
    
    // Parse type counts
    const typeCounts = data.type_counts || {};
    
    return {
      total: parseInt(data.total),
      today: parseInt(data.today),
      thisWeek: parseInt(data.this_week),
      thisMonth: parseInt(data.this_month),
      byType: {
        Local: parseInt(typeCounts.Local || '0'),
        Visitor: parseInt(typeCounts.Visitor || '0'),
        Tourist: parseInt(typeCounts.Tourist || '0'),
        Other: parseInt(typeCounts.Other || '0'),
      },
      growth: {
        dailyAverage,
        weeklyGrowth,
        trend: trend as 'up' | 'down' | 'stable',
      },
      lastUpdated: now.toISOString(),
    };
  } catch (error) {
    console.error('Failed to get member stats:', error);
    throw error;
  }
}

// Page counter operations
export async function getPageCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT view_count 
      FROM page_views 
      ORDER BY id DESC 
      LIMIT 1
    `;
    return result[0]?.view_count || 0;
  } catch (error) {
    console.error('Failed to get page count:', error);
    throw error;
  }
}

export async function incrementPageCount(): Promise<number> {
  try {
    const result = await sql`
      UPDATE page_views 
      SET view_count = view_count + 1, last_updated = NOW()
      WHERE id = (SELECT id FROM page_views ORDER BY id DESC LIMIT 1)
      RETURNING view_count
    `;
    return result[0]?.view_count || 0;
  } catch (error) {
    console.error('Failed to increment page count:', error);
    throw error;
  }
}

export default sql;