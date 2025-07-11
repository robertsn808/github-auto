// src/utils/retry.js
/**
 * Comprehensive retry logic with exponential backoff, jitter, and circuit breaker
 */

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  exponentialBase: 2,
  jitter: true,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNRESET' ||
      (error.response && error.response.status >= 500) ||
      (error.response && error.response.status === 429) // Rate limit
    );
  },
  onRetry: (error, attempt) => {
    console.log(`Retry attempt ${attempt} after error:`, error.message);
  }
};

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (attempt, config) => {
  const exponentialDelay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
  
  if (config.jitter) {
    // Add random jitter to prevent thundering herd
    const jitterAmount = cappedDelay * 0.1; // 10% jitter
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
    return Math.max(0, cappedDelay + jitter);
  }
  
  return cappedDelay;
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main retry function
 */
export const retry = async (fn, config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!finalConfig.retryCondition(error)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === finalConfig.maxAttempts) {
        throw error;
      }
      
      // Call retry callback
      if (finalConfig.onRetry) {
        finalConfig.onRetry(error, attempt);
      }
      
      // Calculate and wait for delay
      const delay = calculateDelay(attempt, finalConfig);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Retry decorator for class methods
 */
export const retryable = (config = {}) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      return await retry(() => originalMethod.apply(this, args), config);
    };
    
    return descriptor;
  };
};

/**
 * Circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.requestCount = 0;
    
    // Stats tracking
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalTimeouts: 0,
      averageResponseTime: 0,
      lastError: null
    };
  }
  
  /**
   * Check if circuit should be opened
   */
  shouldOpen() {
    return this.failureCount >= this.failureThreshold;
  }
  
  /**
   * Check if circuit should attempt reset
   */
  shouldAttemptReset() {
    return this.state === 'OPEN' && 
           Date.now() - this.lastFailureTime >= this.resetTimeout;
  }
  
  /**
   * Record success
   */
  recordSuccess(responseTime = 0) {
    this.failureCount = 0;
    this.successCount++;
    this.requestCount++;
    this.stats.totalRequests++;
    
    // Update average response time
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }
  
  /**
   * Record failure
   */
  recordFailure(error) {
    this.failureCount++;
    this.requestCount++;
    this.stats.totalRequests++;
    this.stats.totalFailures++;
    this.stats.lastError = error;
    this.lastFailureTime = Date.now();
    
    if (error.code === 'ETIMEDOUT') {
      this.stats.totalTimeouts++;
    }
    
    if (this.shouldOpen()) {
      this.state = 'OPEN';
    }
  }
  
  /**
   * Execute function with circuit breaker
   */
  async execute(fn) {
    // Check circuit state
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const responseTime = Date.now() - startTime;
      this.recordSuccess(responseTime);
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
}   }