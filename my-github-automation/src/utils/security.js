
/**
 * Security utilities for safe API key handling and input validation
 */

// Rate limiting store (in-memory for client-side)
const rateLimitStore = new Map();

/**
 * Validate and sanitize repository URLs
 */
export const validateRepositoryUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Repository URL is required and must be a string');
  }

  // Remove whitespace and normalize
  const cleanUrl = url.trim().toLowerCase();
  
  // Validate GitHub URL format
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
  
  if (!githubUrlPattern.test(cleanUrl)) {
    throw new Error('Invalid GitHub repository URL format. Expected: https://github.com/owner/repo');
  }

  // Extract owner and repo
  const urlParts = cleanUrl.replace('https://github.com/', '').replace(/\/$/, '').split('/');
  const [owner, repo] = urlParts;

  // Validate owner and repo names
  const namePattern = /^[a-zA-Z0-9._-]+$/;
  if (!namePattern.test(owner) || !namePattern.test(repo)) {
    throw new Error('Invalid repository owner or name. Only alphanumeric characters, dots, hyphens, and underscores are allowed');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /[<>'"]/,         // Script injection
    /javascript:/i,   // JavaScript protocol
    /data:/i,         // Data URI
    /file:/i          // File protocol
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(cleanUrl)) {
      throw new Error('Repository URL contains suspicious characters');
    }
  }

  return {
    url: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    isValid: true
  };
};

/**
 * Validate API keys securely
 */
export const validateApiKey = (apiKey, keyType = 'github') => {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error(`${keyType} API key is required`);
  }

  // Remove whitespace
  const cleanKey = apiKey.trim();

  // Validate key format based on type
  const keyPatterns = {
    // eslint-disable-next-line no-useless-escape
    github: /^gh[ps]_[a-zA-Z0-9]{36,}$/,
    openai: /^sk-[a-zA-Z0-9]{48,}$/
  };

  if (keyPatterns[keyType] && !keyPatterns[keyType].test(cleanKey)) {
    throw new Error(`Invalid ${keyType} API key format`);
  }

  // Check for common placeholder values
  const placeholders = [
    'your_api_key',
    'your_token',
    'replace_me',
    'example_key',
    'test_key'
  ];

  if (placeholders.some(placeholder => cleanKey.toLowerCase().includes(placeholder))) {
    throw new Error(`${keyType} API key appears to be a placeholder`);
  }

  return cleanKey;
};

/**
 * Rate limiting implementation
 */
export const createRateLimiter = (options = {}) => {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    keyGenerator = 'default'
  } = options;

  return {
    checkLimit: (key = keyGenerator) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Get or create rate limit data for this key
      if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, []);
      }
      
      const requests = rateLimitStore.get(key);
      
      // Remove old requests outside the window
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      
      // Check if limit exceeded
      if (recentRequests.length >= maxRequests) {
        const oldestRequest = Math.min(...recentRequests);
        const resetTime = oldestRequest + windowMs;
        
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((resetTime - now) / 1000)} seconds`);
      }
      
      // Add current request
      recentRequests.push(now);
      rateLimitStore.set(key, recentRequests);
      
      return {
        allowed: true,
        remaining: maxRequests - recentRequests.length,
        resetTime: windowStart + windowMs
      };
    },
    
    getRemainingRequests: (key = keyGenerator) => {
      if (!rateLimitStore.has(key)) return maxRequests;
      
      const now = Date.now();
      const windowStart = now - windowMs;
      const requests = rateLimitStore.get(key);
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      
      return Math.max(0, maxRequests - recentRequests.length);
    }
  };
};

/**
 * Secure input sanitization
 */
export const sanitizeInput = (input, type = 'text') => {
  if (!input) return '';
  
  let sanitized = String(input).trim();
  
  switch (type) {
    case 'filename':
      // Remove path traversal and dangerous characters
      sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
      sanitized = sanitized.replace(/\.\./g, '');
      break;
      
    case 'text':
      // Remove HTML tags and script content
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      break;
      
    case 'url':
      // Validate URL format
      try {
        new URL(sanitized);
      } catch {
        throw new Error('Invalid URL format');
      }
      break;
      
    case 'json':
      // Validate JSON format
      try {
        JSON.parse(sanitized);
      } catch {
        throw new Error('Invalid JSON format');
      }
      break;

    default:
      throw new Error(`Unknown sanitization type: ${type}`);

  }
  
  return sanitized;
};

/**
 * Content Security Policy helpers
 */
export const createCSPHeader = (options = {}) => {
  const {
    allowInlineScripts = false,
    allowEval = false,
    allowedDomains = ['github.com', 'api.openai.com']
  } = options;

  const directives = [
    "default-src 'self'",
    `connect-src 'self' ${allowedDomains.join(' ')}`,
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    allowInlineScripts ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ];

  if (!allowEval) {
    directives.push("script-src-attr 'none'");
  }

  return directives.join('; ');
};

/**
 * Secure random ID generation
 */
export const generateSecureId = (length = 32) => {
  const array = new Uint8Array(length);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback: use Math.random (not cryptographically secure)
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Password/token strength validation
 */
export const validateTokenStrength = (token) => {
  const checks = {
    length: token.length >= 32,
    hasUppercase: /[A-Z]/.test(token),
    hasLowercase: /[a-z]/.test(token),
    hasNumbers: /\d/.test(token),
    hasSpecialChars: /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>?]/.test(token),
    notCommonPattern: !/(123|abc|password|admin|test)/i.test(token)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    isStrong: score >= 4,
    score,
    checks,
    suggestions: Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => `Token should ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
  };
};

/**
 * Safe JSON parsing with size limits
 */
export const safeJSONParse = (jsonString, maxSize = 10 * 1024 * 1024) => { // 10MB default
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('Invalid JSON string');
  }

  if (jsonString.length > maxSize) {
    throw new Error(`JSON string too large. Maximum size: ${maxSize} bytes`);
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
};

/**
 * Environment variable validation
 */
export const validateEnvironment = () => {
  const required = [
    'REACT_APP_GITHUB_TOKEN',
    'REACT_APP_OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate each key
  try {
    validateApiKey(process.env.REACT_APP_GITHUB_TOKEN, 'github');
    validateApiKey(process.env.REACT_APP_OPENAI_API_KEY, 'openai');
  } catch (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  return true;
};

// Export rate limiter instances
export const githubRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: 'github-api'
});

export const openaiRateLimiter = createRateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: 'openai-api'
});