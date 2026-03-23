import { Request, Response, NextFunction } from 'express';
import { RBACService } from './RBACService';
import { AuditService } from './AuditService';
import { createDatabaseConnection } from '../database/connection';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
      };
    }
  }
}

const rbacService = new RBACService();
const db = createDatabaseConnection();

export const rbacMiddleware = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const tenantId = req.headers['x-tenant-id'] as string | undefined;
      
      if (!userId || !tenantId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Set tenant context for RLS
      await setTenantContext(tenantId, userId);
      
      const hasPermission = await rbacService.checkPermission(
        userId, 
        requiredPermission,
        req.params.id
      );

      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Log permission usage for audit
      await AuditService.logPermissionUse(userId, requiredPermission, req.path);
      
      next();
    } catch (error) {
      console.error('Authorization check failed:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Helper to set PostgreSQL RLS context
async function setTenantContext(tenantId: string, userId: string): Promise<void> {
  const pool = db.getPool();
  
  // Get user role to set in context
  const userQuery = await pool.query(
    'SELECT role FROM users WHERE id = $1 AND tenant_id = $2',
    [userId, tenantId]
  );
  
  const userRole = userQuery.rows[0]?.role || 'viewer';
  
  await pool.query('SET app.current_tenant_id = $1', [tenantId]);
  await pool.query('SET app.current_user_id = $1', [userId]);
  await pool.query('SET app.user_role = $1', [userRole]);
}

// Middleware to extract user from JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  // Verify JWT token (implementation would depend on your JWT library)
  import('jsonwebtoken').then(({ default: jwt }) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
      if (err) {
        res.status(403).json({ error: 'Invalid token' });
        return;
      }
      
      req.user = user;
      next();
    });
  }).catch(() => {
    res.status(500).json({ error: 'Token verification failed' });
  });
};

// Combined middleware for authentication + authorization
export const requireAuth = (requiredPermission: string) => [
  authenticateToken,
  rbacMiddleware(requiredPermission)
];
