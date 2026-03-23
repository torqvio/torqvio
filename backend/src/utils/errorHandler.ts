import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { logger } from './logger.js';

// Standard error codes matching documentation
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  WORKFLOW_EXECUTION_FAILED = 'WORKFLOW_EXECUTION_FAILED',
  WORKFLOW_TIMEOUT = 'WORKFLOW_TIMEOUT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// Standard error response interface
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
  };
}

// Custom error class for structured errors
export class TorqvioError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly statusCode: number;
  public readonly requestId: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.name = 'TorqvioError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.requestId = requestId || 'unknown';
  }
}

// Create standardized error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  requestId: string,
  details?: any
): ErrorResponse {
  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      request_id: requestId
    }
  };
}

// Global error handler middleware
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req as any).requestId || 'unknown';
  
  // Log the error
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle Torqvio errors
  if (error instanceof TorqvioError) {
    const response = createErrorResponse(
      error.code,
      error.message,
      requestId,
      error.details
    );
    
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
    const response = createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      'Input validation failed',
      requestId,
      error.details || { errors: [error.message] }
    );
    
    res.status(422).json(response);
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const response = createErrorResponse(
      ErrorCode.AUTHENTICATION_FAILED,
      'Invalid authentication token',
      requestId,
      { hint: 'Check your API key or authentication method' }
    );
    
    res.status(401).json(response);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    const response = createErrorResponse(
      ErrorCode.AUTHENTICATION_FAILED,
      'Authentication token has expired',
      requestId,
      { hint: 'Please refresh your token or re-authenticate' }
    );
    
    res.status(401).json(response);
    return;
  }

  // Handle database errors
  if (error.code === 'ECONNRESET' || error.code === 'CONNECTION_TERMINATED') {
    const response = createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      'Database connection failed',
      requestId,
      { retry_after: '30 seconds', connection_pool: 'exhausted' }
    );
    
    res.status(502).json(response);
    return;
  }

  // Default internal server error
  const response = createErrorResponse(
    ErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    requestId,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  );

  res.status(500).json(response);
}

// Request ID middleware
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || 
                    `req_${randomBytes(16).toString('hex')}`;
  
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

// Helper functions for common errors
export const ErrorHelpers = {
  validationError: (message: string, details?: any, requestId?: string) => 
    new TorqvioError(ErrorCode.VALIDATION_ERROR, message, 422, details, requestId),
    
  authenticationError: (message: string = 'Authentication failed', details?: any, requestId?: string) =>
    new TorqvioError(ErrorCode.AUTHENTICATION_FAILED, message, 401, details, requestId),
    
  authorizationError: (message: string = 'Insufficient permissions', details?: any, requestId?: string) =>
    new TorqvioError(ErrorCode.AUTHORIZATION_FAILED, message, 403, details, requestId),
    
  notFoundError: (resource: string = 'Resource', requestId?: string) =>
    new TorqvioError(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404, undefined, requestId),
    
  conflictError: (message: string, details?: any, requestId?: string) =>
    new TorqvioError(ErrorCode.RESOURCE_CONFLICT, message, 409, details, requestId),
    
  rateLimitError: (limit: number, window: string, resetTime: string, requestId?: string) =>
    new TorqvioError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      { limit, window, reset_time: resetTime },
      requestId
    ),
    
  databaseError: (message: string = 'Database operation failed', details?: any, requestId?: string) =>
    new TorqvioError(ErrorCode.DATABASE_ERROR, message, 502, details, requestId),
    
  workflowError: (message: string, details?: any, requestId?: string) =>
    new TorqvioError(ErrorCode.WORKFLOW_EXECUTION_FAILED, message, 500, details, requestId),
    
  timeoutError: (duration: string, requestId?: string) =>
    new TorqvioError(
      ErrorCode.WORKFLOW_TIMEOUT,
      'Workflow execution exceeded maximum duration',
      408,
      { timeout: '30 minutes', actual_duration: duration },
      requestId
    ),
    
  limitExceededError: (limit: string, current: string, requestId?: string) =>
    new TorqvioError(
      ErrorCode.RESOURCE_LIMIT_EXCEEDED,
      'Account resource limit exceeded',
      429,
      { limit, current, upgrade_plan: 'https://torqvio.com/billing' },
      requestId
    ),
    
  serviceUnavailableError: (message: string = 'Service temporarily unavailable', requestId?: string) =>
    new TorqvioError(ErrorCode.SERVICE_UNAVAILABLE, message, 503, undefined, requestId)
};
