import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = '.cache/member-stats.json';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface MemberStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: {
    Local: number;
    Visitor: number;
    Tourist: number;
    Other: number;
  };
  growth: {
    dailyAverage: number;
    weeklyGrowth: number;
    trend: 'up' | 'down' | 'stable';
  };
  lastUpdated: string;
  cacheVersion: string;
}

export async function getMemberStats(options = { useCache: true }): Promise<MemberStats> {
  // Check cache first
  if (options.useCache && fs.existsSync(CACHE_FILE)) {
    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const age = Date.now() - new Date(cache.lastUpdated).getTime();
      
      if (age < CACHE_DURATION) {
        console.log('Using cached member stats');
        return cache;
      }
    } catch (error) {
      console.warn('Failed to read cache, computing fresh stats:', error);
    }
  }
  
  // Compute fresh stats
  console.log('Computing fresh member stats...');
  const stats = await computeMemberStats();
  
  // Save to cache
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(stats, null, 2));
    console.log('Cached member stats written');
  } catch (error) {
    console.warn('Failed to write cache:', error);
  }
  
  return stats;
}

async function computeMemberStats(): Promise<MemberStats> {
  const leads = await getCollection('leads', ({ data }) => data.published !== false);
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

// Export for use in static builds
export default getMemberStats;