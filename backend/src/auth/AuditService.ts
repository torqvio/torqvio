export interface AuditLog {
  id: string;
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string | undefined;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  outcome: 'success' | 'failure';
  details?: any;
}

export class AuditService {
  static async logPermissionUse(userId: string, permission: string, path: string): Promise<void> {
    try {
      const auditLog: Partial<AuditLog> = {
        userId,
        action: 'permission_check',
        resource: permission,
        ipAddress: '127.0.0.1', // Would extract from request
        userAgent: 'Torqvio-System', // Would extract from request
        timestamp: new Date(),
        outcome: 'success',
        details: {
          path,
          permission
        }
      };

      // In a real implementation, this would save to database
      console.log('Audit log:', auditLog);
    } catch (error) {
      console.error('Failed to log permission use:', error);
    }
  }

  static async logUserAction(
    userId: string, 
    action: string, 
    resource: string, 
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      const auditLog: Partial<AuditLog> = {
        userId,
        action,
        resource,
        resourceId,
        ipAddress: '127.0.0.1',
        userAgent: 'Torqvio-System',
        timestamp: new Date(),
        outcome: 'success',
        details
      };

      console.log('User action audit:', auditLog);
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  static async logSecurityEvent(
    userId: string,
    event: string,
    severity: 'low' | 'medium' | 'high',
    details?: any
  ): Promise<void> {
    try {
      const auditLog: Partial<AuditLog> = {
        userId,
        action: 'security_event',
        resource: event,
        ipAddress: '127.0.0.1',
        userAgent: 'Torqvio-System',
        timestamp: new Date(),
        outcome: 'success',
        details: {
          severity,
          ...details
        }
      };

      console.log('Security event audit:', auditLog);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}
