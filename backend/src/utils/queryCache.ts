import { DatabaseConnection } from '../database/connection.js';

// Simple in-memory cache for development/testing
// In production, replace with Redis or similar
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 300000; // 5 minutes
  private readonly maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Generate cache key from query and parameters
   */
  private generateKey(query: string, params?: any[]): string {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
    const paramString = params ? JSON.stringify(params) : '';
    return `${normalizedQuery}:${paramString}`;
  }

  /**
   * Get cached result
   */
  async get<T>(query: string, params?: any[]): Promise<T | null> {
    const key = this.generateKey(query, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  async set<T>(query: string, data: T, params?: any[], ttl?: number): Promise<void> {
    const key = this.generateKey(query, params);
    
    // Enforce max size
    if (this.cache.size >= this.maxSize) {
      // Delete oldest entry (simple LRU)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern, 'i');
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for real implementation
    };
  }

  /**
   * Destroy cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global cache instance
const queryCache = new QueryCache();

/**
 * Cached database query wrapper
 */
export async function cachedQuery<T = any>(
  query: string, 
  params?: any[], 
  ttl?: number
): Promise<T[]> {
  // Try cache first
  const cached = await queryCache.get<T[]>(query, params);
  if (cached) {
    return cached;
  }

  // Execute query and cache result
  const db = DatabaseConnection.getInstance();
  const result = await db.query<T>(query, params);
  
  // Cache the result (only cache successful queries)
  await queryCache.set(query, result, params, ttl);
  
  return result;
}

/**
 * Cached single row query
 */
export async function cachedQueryOne<T = any>(
  query: string, 
  params?: any[], 
  ttl?: number
): Promise<T | null> {
  const rows = await cachedQuery<T>(query, params, ttl);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Invalidate cache for specific patterns
 */
export function invalidateCache(pattern: string): void {
  queryCache.invalidate(pattern);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  queryCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; hitRate: number } {
  return queryCache.getStats();
}

// Cleanup on process exit
process.on('SIGTERM', () => {
  queryCache.destroy();
});

process.on('SIGINT', () => {
  queryCache.destroy();
});
