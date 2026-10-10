import rateLimit from 'express-rate-limit';

/**
 * General-purpose API rate limiter.
 * Restricts each IP to a reasonable number of requests per window.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * Stricter rate limiter for analysis-trigger endpoints.
 */
export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many analysis requests. Please try again later.',
    },
  },
});
