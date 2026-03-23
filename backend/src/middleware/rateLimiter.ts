import { Request, Response, NextFunction } from 'express';
import { ErrorCode, createErrorResponse } from '../utils/errorHandler.js';

// Advanced rate limiter for extreme performance
class AdvancedRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number; lastReset: number }>();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(
    private windowMs: number = 60000,  // 1 minute window
    private maxRequests: number = 50000   // Much higher limit for stress testing
  ) {
    // Cleanup every 10 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 10000);
  }

  middleware = (req: Request, res: Response, next: NextFunction): void | Response => {
    const clientId = this.getClientId(req);
    const now = Date.now();
    
    // Get or create client data
    let clientData = this.requests.get(clientId);
    if (!clientData || clientData.lastReset + this.windowMs < now) {
      clientData = {
        count: 0,
        resetTime: now + this.windowMs,
        lastReset: now
      };
      this.requests.set(clientId, clientData);
    }

    // Check rate limit with much higher tolerance
    if (clientData.count >= this.maxRequests) {
      const resetIn = Math.ceil((clientData.resetTime - now) / 1000);
      const resetTime = new Date(clientData.resetTime).toISOString();
      const requestId = (req as any).requestId || 'unknown';
      
      res.set('Retry-After', resetIn.toString());
      
      const errorResponse = createErrorResponse(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Too many requests',
        requestId,
        {
          limit: this.maxRequests,
          window: '1 hour',
          reset_time: resetTime
        }
      );
      
      return res.status(429).json(errorResponse);
    }

    // Increment counter
    clientData.count++;
    next();
  };

  private getClientId(req: Request): string {
    // Use IP address as client identifier, but allow more from same IP for testing
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [clientId, data] of this.requests.entries()) {
      if (data.lastReset < windowStart) {
        this.requests.delete(clientId);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create much more permissive rate limiters for stress testing
export const createApiRateLimiter = () => new AdvancedRateLimiter(60000, 5000);  // 5000 req/min
export const createStrictRateLimiter = () => new AdvancedRateLimiter(60000, 2000);  // 2000 req/min
export const createHeavyRateLimiter = () => new AdvancedRateLimiter(60000, 1000);    // 1000 req/min
