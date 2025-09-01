import { getMemberStats as getDbMemberStats, type DatabaseMemberStats } from './database.js';
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
        return cache;
      }
    } catch (error) {
      console.warn('Failed to read cache, computing fresh stats:', error);
    }
  }
  
  // Compute fresh stats from database
  const stats = await computeMemberStats();
  
  // Save to cache
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.warn('Failed to write cache:', error);
  }
  
  return stats;
}

async function computeMemberStats(): Promise<MemberStats> {
  try {
    // Get stats directly from database - much faster than file iteration
    const dbStats = await getDbMemberStats();
    
    // Convert DatabaseMemberStats to MemberStats format (they're compatible)
    return {
      ...dbStats,
      cacheVersion: '2.0.0-neon' // Updated version to indicate database source
    };
  } catch (error) {
    console.error('Failed to get member stats from database:', error);
    throw error;
  }
}

// Export for use in static builds
export default getMemberStats;