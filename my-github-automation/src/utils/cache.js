// src/utils/cache.js
/**
 * Advanced caching system with TTL, size limits, and LRU eviction
 */

class Cache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100; // Maximum number of entries
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.maxMemorySize = options.maxMemorySize || 50 * 1024 * 1024; // 50MB
    this.storage = new Map();
    this.accessOrder = new Map(); // For LRU tracking
    this.memoryUsage = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0
    };
  }

  /**
   * Calculate approximate memory size of a value
   */
  getMemorySize(value) {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') {
      return value.length * 2; // Unicode characters can be 2 bytes
    }
    
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 4;
    
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    
    return 0;
  }

  /**
   * Update access order for LRU
   */
  updateAccessOrder(key) {
    if (this.accessOrder.has(key)) {
      this.accessOrder.delete(key);
    }
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Evict least recently used items
   */
  evictLRU() {
    const entries = Array.from(this.accessOrder.entries());
    entries.sort(([, a], [, b]) => a - b); // Sort by access time
    
    // Evict oldest entries
    for (const [key] of entries.slice(0, Math.ceil(this.maxSize * 0.1))) {
      this.delete(key);
      this.stats.evictions++;
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.storage) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.delete(key);
      }
    }
  }

  /**
   * Set a value in cache
   */
  set(key, value, ttl = this.defaultTTL) {
    if (!key) throw new Error('Cache key is required');
    
    const size = this.getMemorySize(value);
    
    // Check memory limits
    if (size > this.maxMemorySize) {
      console.warn(`Cache item too large: ${size} bytes. Skipping cache.`);
      return false;
    }
    
    // Clean up if needed
    this.cleanupExpired();
    
    // Evict if at capacity
    if (this.storage.size >= this.maxSize) {
      this.evictLRU();
    }
    
    // Check if we still have memory after eviction
    if (this.memoryUsage + size > this.maxMemorySize) {
      // Evict more aggressively
      while (this.memoryUsage + size > this.maxMemorySize && this.storage.size > 0) {
        this.evictLRU();
      }
    }
    
    // Remove old entry if exists
    if (this.storage.has(key)) {
      const oldEntry = this.storage.get(key);
      this.memoryUsage -= this.getMemorySize(oldEntry.value);
    }
    
    // Add new entry
    const entry = {
      value,
      createdAt: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
      size,
      accessCount: 0
    };
    
    this.storage.set(key, entry);
    this.memoryUsage += size;
    this.updateAccessOrder(key);
    this.stats.sets++;
    
    return true;
  }

  /**
   * Get a value from cache
   */
  get(key) {
    if (!key) return null;
    
    const entry = this.storage.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    this.updateAccessOrder(key);
    this.stats.hits++;
    
    return entry.value;
  }

  /**
   * Delete a value from cache
   */
  delete(key) {
    const entry = this.storage.get(key);
    if (entry) {
      this.memoryUsage -= entry.size;
      this.storage.delete(key);
      this.accessOrder.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Check if key exists (without updating access)
   */
  has(key) {
    const entry = this.storage.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.storage.clear();
    this.accessOrder.clear();
    this.memoryUsage = 0;
    this.stats = { hits: 0, misses: 0, evictions: 0, sets: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.storage.size,
      memoryUsage: this.memoryUsage,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      averageItemSize: this.storage.size > 0 ? this.memoryUsage / this.storage.size : 0
    };
  }

  /**
   * Get or set with function (cache-aside pattern)
   */
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    let value = this.get(key);
    
    if (value !== null) {
      return value;
    }
    
    try {
      value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error(`Cache fetch function failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  setMultiple(entries, ttl = this.defaultTTL) {
    const results = {};
    for (const [key, value] of Object.entries(entries)) {
      results[key] = this.set(key, value, ttl);
    }
    return results;
  }

  getMultiple(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = this.get(key);
    }
    return results;
  }

  deleteMultiple(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = this.delete(key);
    }
    return results;
  }

  /**
   * Cache warming - preload data
   */
  async warm(warmingFunctions) {
    const promises = Object.entries(warmingFunctions).map(async ([key, fn]) => {
      try {
        const value = await fn();
        this.set(key, value);
        return { key, success: true };
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
        return { key, success: false, error: error.message };
      }
    });
    
    return await Promise.allSettled(promises);
  }
}

// Cache instances for different data types
export const apiCache = new Cache({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxMemorySize: 20 * 1024 * 1024 // 20MB
});

export const repoCache = new Cache({
  maxSize: 50,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxMemorySize: 30 * 1024 * 1024 // 30MB
});

export const analysisCache = new Cache({
  maxSize: 100,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  maxMemorySize: 50 * 1024 * 1024 // 50MB
});

// Cache key generators
export const cacheKeys = {
  repoData: (owner, repo) => `repo:${owner}/${repo}`,
  repoStructure: (owner, repo, branch = 'main') => `structure:${owner}/${repo}:${branch}`,
  fileContent: (owner, repo, path, sha) => `file:${owner}/${repo}:${path}:${sha}`,
  analysis: (owner, repo, analysisType) => `analysis:${owner}/${repo}:${analysisType}`,
  aiAnalysis: (content, model) => `ai:${model}:${content.substring(0, 100)}`, // First 100 chars as key
  rateLimitStatus: (service) => `ratelimit:${service}`,
  userPermissions: (owner, repo, user) => `permissions:${owner}/${repo}:${user}`
};

// Cache decorators/utilities
export const withCache = (cache, keyGenerator, ttl) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      let result = cache.get(key);
      if (result !== null) {
        return result;
      }
      
      // Execute original method
      result = await originalMethod.apply(this, args);
      
      // Cache the result
      cache.set(key, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
};

// Cache middleware for async functions
export const cacheMiddleware = (cache, keyGenerator, ttl) => {
  return (fn) => {
    return async (...args) => {
      const key = keyGenerator(...args);
      
      return await cache.getOrSet(key, () => fn(...args), ttl);
    };
  };
};

// Automatic cache cleanup
export const startCacheCleanup = (interval = 5 * 60 * 1000) => { // 5 minutes
  const cleanup = () => {
    apiCache.cleanupExpired();
    repoCache.cleanupExpired();
    analysisCache.cleanupExpired();
  };
  
  // Initial cleanup
  cleanup();
  
  // Set up periodic cleanup
  const intervalId = setInterval(cleanup, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Export the main Cache class for custom instances
export { Cache };