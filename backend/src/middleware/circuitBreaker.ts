import { Request, Response, NextFunction } from 'express';

// Circuit breaker pattern to prevent cascading failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,      // Failures before opening
    private timeout = 60000,    // Time to stay open (ms)
    private resetTimeout = 30000 // Time to attempt reset (ms)
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  middleware = (req: Request, res: Response, next: NextFunction) => {
    if (this.state === 'OPEN') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Circuit breaker is OPEN - service temporarily unavailable'
      });
    }
    next();
  };

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

export const dbCircuitBreaker = new CircuitBreaker(10, 30000, 15000);
