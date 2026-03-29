import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  BusinessLogicError,
  ApiResponse 
} from '../types/index.js';

/**
 * Centralized error handling middleware
 * Provides consistent error responses across all API endpoints
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error instanceof ValidationError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.field ? { field: error.field } : undefined,
        timestamp: new Date().toISOString()
      }
    };
    res.status(400).json(response);
    return;
  }

  if (error instanceof NotFoundError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
    res.status(404).json(response);
    return;
  }

  if (error instanceof UnauthorizedError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
    res.status(401).json(response);
    return;
  }

  if (error instanceof BusinessLogicError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'BUSINESS_LOGIC_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
    res.status(422).json(response);
    return;
  }

  // Handle database errors
  if (error.message.includes('database') || error.message.includes('SQL')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(response);
    return;
  }

  // Handle network/API errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'A network error occurred',
        timestamp: new Date().toISOString()
      }
    };
    res.status(502).json(response);
    return;
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      timestamp: new Date().toISOString()
    }
  };
  res.status(500).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString()
    }
  };
  res.status(404).json(response);
}

/**
 * Async error wrapper for route handlers
 * Eliminates need for try-catch blocks in individual routes
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request logging middleware
 * Logs all incoming requests for debugging and monitoring
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
}

/**
 * Rate limiting middleware (basic implementation)
 * Prevents abuse of API endpoints
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [ip, data] of rateLimitMap.entries()) {
      if (data.resetTime < now) {
        rateLimitMap.delete(ip);
      }
    }
    
    // Check current rate limit
    const current = rateLimitMap.get(key);
    
    if (!current) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (current.resetTime < now) {
      current.count = 1;
      current.resetTime = now + windowMs;
      return next();
    }
    
    if (current.count >= maxRequests) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          timestamp: new Date().toISOString()
        }
      };
      res.status(429).json(response);
      return;
    }
    
    current.count++;
    next();
  };
}
