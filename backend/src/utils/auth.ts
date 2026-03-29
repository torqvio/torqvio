import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logger.js';
import { DatabaseConnection } from '../database/connection.js';
import { promisify } from 'util';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { ErrorCode, createErrorResponse, ErrorHelpers } from './errorHandler.js';

const scryptAsync = promisify(scrypt);

// Enhanced JWT Payload with more user information
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  sessionId: string;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

// Refresh Token Payload
interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// User session information
interface UserSession {
  id: string;
  userId: string;
  tokenVersion: number;
  createdAt: Date;
  lastAccessed: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      session?: UserSession;
      projectId?: string;
      eventBus?: any;
      eventModel?: any;
      eventProcessor?: any;
      eventSubscriptionModel?: any;
    }
  }
}

export type AuthenticatedRequest = Request;

// Role hierarchy for authorization
const ROLE_HIERARCHY = {
  admin: 3,
  user: 2,
  viewer: 1
} as const;

// Session store (in production, use Redis)
const activeSessions = new Map<string, UserSession>();

// Enhanced token authentication with session validation
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const requestId = (req as any).requestId;
    const response = createErrorResponse(
      ErrorCode.AUTHENTICATION_FAILED,
      'Access token required',
      requestId,
      { hint: 'Authorization header with Bearer token is required' }
    );
    res.status(401).json(response);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  jwt.verify(token, jwtSecret, { 
    issuer: 'torqvio',
    audience: 'torqvio-client'
  }, (err: any, user: any) => {
    if (err) {
      let errorMessage = 'Token is invalid or expired';
      let errorDetails = { hint: 'Check your API key in the dashboard' };
      
      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorDetails = { hint: 'Please refresh your token or re-authenticate' };
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Token is malformed';
        errorDetails = { hint: 'Token format is invalid' };
      }
      
      logger.warn('Invalid JWT token', { 
        error: err.message, 
        errorCode: errorMessage,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const requestId = (req as any).requestId;
      const response = createErrorResponse(
        ErrorCode.AUTHENTICATION_FAILED,
        errorMessage,
        requestId,
        errorDetails
      );
      
      res.status(403).json(response);
      return;
    }

    const payload = user as JWTPayload;
    
    // Validate session for access tokens
    if (payload.type === 'access' && payload.sessionId) {
      const session = activeSessions.get(payload.sessionId);
      if (!session || !session.isActive || session.userId !== payload.userId) {
        logger.warn('Invalid session', { 
          sessionId: payload.sessionId,
          userId: payload.userId,
          ip: req.ip
        });
        
        const requestId = (req as any).requestId;
        const response = createErrorResponse(
          ErrorCode.AUTHENTICATION_FAILED,
          'Session invalid or expired',
          requestId,
          { hint: 'Please login again' }
        );
        
        res.status(403).json(response);
        return;
      }
      
      // Update last accessed time
      session.lastAccessed = new Date();
      req.session = session;
    }

    req.user = payload;
    next();
  });
}

// Enhanced token generation with session management
export function generateTokens(userId: string, email: string, role: 'admin' | 'user' | 'viewer') {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
  
  const sessionId = randomBytes(16).toString('hex');
  const tokenVersion = 1;
  
  // Store session
  const session: UserSession = {
    id: sessionId,
    userId,
    tokenVersion,
    createdAt: new Date(),
    lastAccessed: new Date(),
    isActive: true
  };
  activeSessions.set(sessionId, session);
  
  const accessToken = jwt.sign(
    { 
      userId, 
      email, 
      role, 
      sessionId,
      type: 'access'
    } as JWTPayload, 
    jwtSecret, 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '15m' // Short-lived access token
    } as jwt.SignOptions
  );
  
  const refreshToken = jwt.sign(
    { 
      userId, 
      sessionId,
      tokenVersion
    } as RefreshTokenPayload, 
    refreshSecret, 
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' // Long-lived refresh token
    } as jwt.SignOptions
  );
  
  return { accessToken, refreshToken, sessionId };
}

// Legacy token generation for backward compatibility
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'sessionId' | 'type'> & { role?: 'admin' | 'user' | 'viewer' }): string {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  return jwt.sign({ ...payload, type: 'access', role: payload.role || 'viewer' }, jwtSecret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  } as jwt.SignOptions);
}

// Enhanced API key authentication with caching
const API_KEY_CACHE = new Map<string, { project: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

// Enhanced API key authentication with rate limiting
export async function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Support both X-API-Key header and Authorization: Bearer format (as documented)
  let apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }
  
  if (!apiKey) {
    const requestId = (req as any).requestId;
    const response = createErrorResponse(
      ErrorCode.AUTHENTICATION_FAILED,
      'API key required',
      requestId,
      { hint: 'X-API-Key header or Authorization: Bearer token is required' }
    );
    res.status(401).json(response);
    return;
  }

  // Validate API key format
  if (apiKey.length < 20) {
    const requestId = (req as any).requestId;
    const response = createErrorResponse(
      ErrorCode.AUTHENTICATION_FAILED,
      'Invalid API key format',
      requestId,
      { hint: 'API key is malformed' }
    );
    res.status(401).json(response);
    return;
  }

  // Check cache first
  const cached = API_KEY_CACHE.get(apiKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    req.projectId = cached.project.id;
    (req as any).project = cached.project;
    next();
    return;
  }

  // Look up project by API key (projects table), then fall back to api_keys table
  const db = DatabaseConnection.getInstance();
  const { createHash } = await import('crypto');
  const keyHash = createHash('sha256').update(apiKey).digest('hex');

  const namedKey = await db.queryOne(
    `SELECT ak.id, ak.user_id, ak.name, ak.permissions, ak.project_id,
            p.name as project_name
     FROM api_keys ak
     LEFT JOIN projects p ON p.id = ak.project_id
     WHERE ak.key_hash = $1 AND ak.is_active = true
       AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
    [keyHash]
  ).catch(() => null);

  if (namedKey) {
    if (!namedKey.project_id) {
      const requestId = (req as any).requestId;
      const response = createErrorResponse(
        ErrorCode.AUTHENTICATION_FAILED,
        'API key is not associated with a project',
        requestId,
        { hint: 'Regenerate your API key from the dashboard to assign it to a project' }
      );
      res.status(401).json(response);
      return;
    }
    await db.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [namedKey.id]).catch(() => {});
    const project = { id: namedKey.project_id, name: namedKey.project_name, owner_id: namedKey.user_id };
    API_KEY_CACHE.set(apiKey, { project, timestamp: now });
    req.projectId = namedKey.project_id;
    (req as any).project = project;
    next();
    return;
  }

  db.queryOne('SELECT id, name, owner_id FROM projects WHERE api_key = $1 AND is_active = true', [apiKey])
    .then(project => {
      if (!project) {
        logger.warn('Invalid API key', {
          apiKeyHash: hashApiKey(apiKey),
          ip: req.ip
        });

        const requestId = (req as any).requestId;
        const response = createErrorResponse(
          ErrorCode.AUTHENTICATION_FAILED,
          'Invalid API key',
          requestId,
          { hint: 'The provided API key is not valid or inactive' }
        );

        res.status(401).json(response);
        return;
      }

      // Cache the result
      API_KEY_CACHE.set(apiKey, { project, timestamp: now });
      
      // Clean up old cache entries periodically
      if (API_KEY_CACHE.size > 1000) {
        for (const [key, value] of API_KEY_CACHE.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            API_KEY_CACHE.delete(key);
          }
        }
      }

      req.projectId = project.id;
      
      // Add project context to request for logging
      (req as any).project = project;
      
      logger.info('API key authenticated', { 
        projectId: project.id,
        projectName: project.name,
        ip: req.ip
      });
      
      next();
    })
    .catch(error => {
      logger.error('Database error during API key authentication:', error);
      const requestId = (req as any).requestId;
      const response = createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        'Authentication failed',
        requestId,
        { hint: 'Internal server error during authentication' }
      );
      res.status(500).json(response);
    });
}

// Helper function to hash API keys for logging
function hashApiKey(apiKey: string): string {
  return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}

// Enhanced optional auth with better error handling
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token provided, continue without auth
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  jwt.verify(token, jwtSecret, { 
    issuer: 'torqvio',
    audience: 'torqvio-client'
  }, (err: any, user: any) => {
    if (err) {
      // Invalid token, but we don't reject the request for optional auth
      logger.warn('Invalid JWT token in optional auth', { 
        error: err.message,
        ip: req.ip
      });
      return next();
    }

    const payload = user as JWTPayload;
    
    // Validate session if present
    if (payload.type === 'access' && payload.sessionId) {
      const session = activeSessions.get(payload.sessionId);
      if (session && session.isActive && session.userId === payload.userId) {
        session.lastAccessed = new Date();
        req.session = session;
        req.user = payload;
      }
    } else {
      req.user = payload;
    }
    
    next();
  });
}

// Role-based authorization middleware
export function requireRole(minimumRole: 'admin' | 'user' | 'viewer') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];

    if (userRoleLevel < requiredRoleLevel) {
      logger.warn('Insufficient permissions', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRole: minimumRole,
        ip: req.ip,
        path: req.path
      });

      res.status(403).json({
        error: 'Insufficient permissions',
        message: `You need ${minimumRole} role or higher to access this resource`,
        code: 'INSUFFICIENT_PERMISSIONS',
        required: minimumRole,
        current: req.user.role
      });
      return;
    }

    next();
  };
}

// Refresh token endpoint handler
export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token required',
      message: 'Refresh token is required',
      code: 'REFRESH_TOKEN_MISSING'
    });
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret, {
      issuer: 'torqvio',
      audience: 'torqvio-client'
    }) as RefreshTokenPayload;

    const session = activeSessions.get(decoded.sessionId);
    if (!session || !session.isActive || session.userId !== decoded.userId) {
      return res.status(403).json({
        error: 'Invalid refresh token',
        message: 'Session is invalid or expired',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    if (session.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).json({
        error: 'Token version mismatch',
        message: 'Refresh token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Get user info
    const db = DatabaseConnection.getInstance();
    const user = await db.queryOne(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User associated with this token no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email, user.role);
    
    // Update session token version
    session.tokenVersion += 1;
    session.lastAccessed = new Date();

    logger.info('Token refreshed', { 
      userId: user.id,
      sessionId: session.id,
      ip: req.ip
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    
    let errorMessage = 'Invalid refresh token';
    let errorCode = 'REFRESH_TOKEN_INVALID';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Refresh token has expired';
      errorCode = 'REFRESH_TOKEN_EXPIRED';
    }
    
    res.status(403).json({
      error: errorMessage,
      message: error.message,
      code: errorCode
    });
  }
}

// Logout and session invalidation
export function invalidateSession(req: Request, res: Response, next: NextFunction) {
  if (req.session) {
    req.session.isActive = false;
    activeSessions.delete(req.session.id);
    
    logger.info('Session invalidated', { 
      sessionId: req.session.id,
      userId: req.session.userId,
      ip: req.ip
    });
  }
  
  next();
}

// Session cleanup utility (call periodically)
export function cleanupExpiredSessions() {
  const now = new Date();
  const expiredSessions: string[] = [];
  
  activeSessions.forEach((session, sessionId) => {
    const hoursSinceLastAccess = (now.getTime() - session.lastAccessed.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAccess > 24 || !session.isActive) {
      expiredSessions.push(sessionId);
    }
  });
  
  expiredSessions.forEach(sessionId => {
    activeSessions.delete(sessionId);
  });
  
  if (expiredSessions.length > 0) {
    logger.info('Cleaned up expired sessions', { count: expiredSessions.length });
  }
}

// Rate limiting helper for auth endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export function checkAuthRateLimit(req: Request, res: Response, next: NextFunction, maxAttempts = 5, windowMinutes = 15) {
  const key = `${req.ip}:${req.path}`;
  const now = new Date();
  const windowMs = windowMinutes * 60 * 1000;
  
  const attempts = authAttempts.get(key);
  
  if (!attempts || (now.getTime() - attempts.lastAttempt.getTime()) > windowMs) {
    authAttempts.set(key, { count: 1, lastAttempt: now });
    return next();
  }
  
  if (attempts.count >= maxAttempts) {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      attempts: attempts.count,
      windowMinutes
    });
    
    return res.status(429).json({
      error: 'Too many authentication attempts',
      message: `Please try again after ${windowMinutes} minutes`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: windowMinutes * 60
    });
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  next();
}
