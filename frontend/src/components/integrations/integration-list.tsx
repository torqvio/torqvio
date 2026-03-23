'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, Trash2, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Integration {
  id: string;
  type: string;
  name: string;
  status: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  events?: string[];
}

interface IntegrationListProps {
  projectId: string;
  onEdit?: (integration: Integration) => void;
  onDelete?: (integration: Integration) => void;
  onTest?: (integration: Integration) => void;
}

export function IntegrationList({ projectId, onEdit, onDelete, onTest }: IntegrationListProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, [projectId]);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/integrations/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      } else {
        throw new Error('Failed to load integrations');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast({
        type: 'error',
        title: 'Failed to Load Integrations',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (integration: Integration) => {
    if (!confirm(`Are you sure you want to delete "${integration.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/integrations/${integration.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIntegrations(prev => prev.filter(i => i.id !== integration.id));
        onDelete?.(integration);
        toast({
          type: 'success',
          title: 'Integration Deleted',
          message: `"${integration.name}" has been removed successfully.`
        });
      } else {
        throw new Error('Failed to delete integration');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete integration';
      toast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage
      });
    }
  };

  const handleTest = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/v1/integrations/${integration.id}/test`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          type: 'success',
          title: 'Test Successful',
          message: `"${integration.name}" is working correctly.`
        });
      } else {
        toast({
          type: 'error',
          title: 'Test Failed',
          message: result.message || `"${integration.name}" test failed.`
        });
      }
      
      onTest?.(integration);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test integration';
      toast({
        type: 'error',
        title: 'Test Error',
        message: errorMessage
      });
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'stripe':
        return '💳';
      case 'shopify':
        return '🛒';
      case 'woocommerce':
        return '🏪';
      case 'custom_api':
      case 'generic':
        return '🔌';
      default:
        return '📦';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-lg font-medium mb-2">No integrations yet</h3>
          <p className="text-gray-500 mb-4">
            Connect your payment processors, e-commerce platforms, and custom APIs to start recovering revenue.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getIntegrationIcon(integration.type)}
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{integration.type.replace('_', ' ')}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(integration.status)}
                    <Badge variant={getStatusColor(integration.status)} className="text-xs">
                      {integration.status}
                    </Badge>
                    {integration.webhookUrl && (
                      <Badge variant="outline" className="text-xs">
                        Webhook Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(integration)}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(integration)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(integration)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {integration.events && integration.events.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Active Events:</div>
                <div className="flex flex-wrap gap-1">
                  {integration.events.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event.replace(/\./g, ' ').replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              Created: {new Date(integration.createdAt).toLocaleDateString()}
              {integration.updatedAt !== integration.createdAt && (
                <span className="ml-4">
                  Updated: {new Date(integration.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
