'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface Role {
  name: string;
  description: string;
}

export function RoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        type: 'error',
        title: 'Failed to Load Users',
        message: 'Unable to load users for role management.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/v1/roles');
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast({
        type: 'error',
        title: 'Failed to Load Roles',
        message: 'Unable to load available roles.'
      });
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      await fetch(`/api/v1/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      
      // Refresh users list
      await loadUsers();
    } catch (error) {
      console.error('Failed to assign role:', error);
      toast({
        type: 'error',
        title: 'Role Assignment Failed',
        message: 'Unable to assign role. Please try again.'
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading role management...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(role) => assignRole(user.id, role)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.name} - {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
