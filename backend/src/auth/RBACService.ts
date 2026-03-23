export interface Role {
  permissions: string[];
  description: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export class RBACService {
  private roles: Map<string, Role> = new Map([
    ['admin', { permissions: ['*'], description: 'Full system access' }],
    ['manager', { 
      permissions: ['workflows:*', 'analytics:*', 'integrations:*', 'users:read', 'reports:*'],
      description: 'Manage workflows and view analytics'
    }],
    ['analyst', { 
      permissions: ['workflows:read', 'analytics:read', 'reports:read', 'integrations:read'],
      description: 'View analytics and reports'
    }],
    ['viewer', { 
      permissions: ['workflows:read', 'analytics:read'],
      description: 'Read-only access'
    }],
    ['billing_owner', { 
      permissions: ['billing:*', 'users:read', 'analytics:read'],
      description: 'Manage billing and view usage'
    }],
    ['integrator', { 
      permissions: ['integrations:*', 'workflows:write', 'analytics:read'],
      description: 'Configure integrations and workflows'
    }]
  ]);

  async checkPermission(userId: string, permission: string, resourceId?: string): Promise<boolean> {
    const user = await this.getUserWithTenant(userId);
    const role = this.roles.get(user.role);
    
    if (!role) return false;
    
    // Check wildcard permissions
    if (role.permissions.includes('*')) return true;
    
    // Check exact permission
    if (role.permissions.includes(permission)) return true;
    
    // Check pattern-based permissions
    const hasPatternPermission = role.permissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix);
      }
      return false;
    });
    
    // Row-level security check
    if (hasPatternPermission && resourceId) {
      return this.checkResourceAccess(userId, resourceId, permission);
    }
    
    return hasPatternPermission;
  }

  private async checkResourceAccess(userId: string, resourceId: string, permission: string): Promise<boolean> {
    // Implement row-level security
    const userTenant = await this.getUserTenant(userId);
    const resourceTenant = await this.getResourceTenant(resourceId);
    
    return userTenant === resourceTenant;
  }

  private async getUserWithTenant(userId: string): Promise<User> {
    // This would typically query your database
    // For now, returning a mock implementation
    return {
      id: userId,
      email: 'user@example.com',
      role: 'viewer',
      tenantId: 'tenant-123'
    };
  }

  private async getUserTenant(userId: string): Promise<string> {
    const user = await this.getUserWithTenant(userId);
    return user.tenantId;
  }

  private async getResourceTenant(resourceId: string): Promise<string> {
    // This would typically query your database to get the tenant of the resource
    // For now, returning a mock implementation
    return 'tenant-123';
  }

  getRole(roleName: string): Role | undefined {
    return this.roles.get(roleName);
  }

  getAllRoles(): Map<string, Role> {
    return this.roles;
  }
}
