'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, Trash2, Activity, CheckCircle, XCircle, Brain, Zap, Puzzle, Link2, TrendingUp, AlertTriangle, Shield, Clock, RefreshCw } from 'lucide-react';
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
  ecosystemConnections?: string[];
  bundleId?: string;
  autoAuthAvailable?: boolean;
  healthScore?: number;
  usageMetrics?: {
    eventsPerDay: number;
    successRate: number;
    avgResponseTime: number;
  };
  version?: string;
  deprecationDate?: string;
  endOfLifeDate?: string;
  complianceStatus?: 'compliant' | 'non_compliant' | 'pending';
  dataResidency?: string;
  circuitBreakerStatus?: 'closed' | 'open' | 'half_open';
  retryAttempts?: number;
  lastError?: string;
}

interface IntegrationBundle {
  id: string;
  name: string;
  description: string;
  integrations: string[];
  popular: boolean;
  setupTime: string;
  discount: number;
}

interface EcosystemRecommendation {
  id: string;
  type: 'bundle' | 'connection' | 'expansion';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  integrations: string[];
  autoSetupAvailable: boolean;
  estimatedTime: string;
}

const INTEGRATION_BUNDLES: IntegrationBundle[] = [
  {
    id: 'ecommerce_stack',
    name: 'E-commerce Power Stack',
    description: 'Complete e-commerce automation with payments, inventory, and notifications',
    integrations: ['stripe', 'shopify', 'slack'],
    popular: true,
    setupTime: '5 min',
    discount: 25
  },
  {
    id: 'crm_suite',
    name: 'CRM Automation Suite',
    description: 'Customer relationship management with email and analytics',
    integrations: ['hubspot', 'sendgrid', 'google_analytics'],
    popular: false,
    setupTime: '8 min',
    discount: 20
  },
  {
    id: 'saas_metrics',
    name: 'SaaS Metrics Bundle',
    description: 'Complete SaaS analytics and reporting stack',
    integrations: ['stripe', 'mixpanel', 'google_analytics', 'slack'],
    popular: true,
    setupTime: '12 min',
    discount: 30
  }
]

const ECOSYSTEM_RECOMMENDATIONS: EcosystemRecommendation[] = [
  {
    id: 'rec_001',
    type: 'bundle',
    title: 'Complete Your E-commerce Stack',
    description: 'Most Shopify users also connect Stripe and Slack for full automation.',
    impact: 'Increase efficiency by 45%',
    confidence: 92,
    integrations: ['stripe', 'slack'],
    autoSetupAvailable: true,
    estimatedTime: '3 min'
  },
  {
    id: 'rec_002',
    type: 'connection',
    title: 'Connect Analytics Pipeline',
    description: 'Your payment data can automatically feed into analytics for better insights.',
    impact: 'Improve decision making by 34%',
    confidence: 87,
    integrations: ['google_analytics', 'mixpanel'],
    autoSetupAvailable: true,
    estimatedTime: '2 min'
  },
  {
    id: 'rec_003',
    type: 'expansion',
    title: 'Add Notification Layer',
    description: 'Real-time notifications for all your integrations improve team response time.',
    impact: 'Reduce response time by 67%',
    confidence: 78,
    integrations: ['slack'],
    autoSetupAvailable: true,
    estimatedTime: '1 min'
  }
]

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
  const [showEcosystem, setShowEcosystem] = useState(true);
  const [bundles] = useState<IntegrationBundle[]>(INTEGRATION_BUNDLES);
  const [recommendations] = useState<EcosystemRecommendation[]>(ECOSYSTEM_RECOMMENDATIONS);
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

  const handleResetCircuitBreaker = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/reset-circuit-breaker`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Circuit breaker reset',
          description: 'The circuit breaker has been reset successfully.',
        });
        fetchIntegrations();
      } else {
        throw new Error('Failed to reset circuit breaker');
      }
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: 'Failed to reset circuit breaker. Please try again.',
        variant: 'destructive',
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

  const handleSetupBundle = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId)
    if (!bundle) return
    
    console.log('Setting up bundle:', bundle.name)
    // In real app, this would trigger bundle setup flow
  };

  const handleApplyRecommendation = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId)
    if (!recommendation) return
    
    console.log('Applying recommendation:', recommendation.title)
    // In real app, this would trigger auto-setup
  };

  const handleAutoAuth = (integrationId: string) => {
    console.log('Starting auto-auth for integration:', integrationId)
    // In real app, this would trigger OAuth flow
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
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'deprecated':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'destructive';
      case 'degraded':
        return 'secondary';
      case 'deprecated':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getCircuitBreakerIcon = (status?: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'half_open':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getComplianceIcon = (status?: string) => {
    switch (status) {
      case 'compliant':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
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
    <div className="space-y-6">
      {/* Ecosystem Intelligence Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Composable Ecosystem</h3>
        <button
          onClick={() => setShowEcosystem(!showEcosystem)}
          className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md transition-colors ${
            showEcosystem 
              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
              : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Ecosystem AI</span>
          {(bundles.length > 0 || recommendations.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Ecosystem Intelligence Panel */}
      {showEcosystem && (
        <div className="space-y-4">
          {/* Integration Bundles */}
          {bundles.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">Integration Bundles</span>
                  <span className="text-xs text-gray-400">{bundles.length} bundle{bundles.length > 1 ? 's' : ''} available</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {bundles.slice(0, 2).map((bundle) => (
                  <div key={bundle.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">{bundle.name}</span>
                        {bundle.popular && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                            Popular
                          </span>
                        )}
                        <span className="text-xs text-green-400">{bundle.discount}% off</span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-2">{bundle.description}</p>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">{bundle.setupTime} setup</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400">{bundle.integrations.length} integrations</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Includes: {bundle.integrations.join(', ')}</p>
                        <button
                          onClick={() => handleSetupBundle(bundle.id)}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          Setup Bundle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ecosystem Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Smart Recommendations</span>
                  <span className="text-xs text-gray-400">{recommendations.length} suggestion{recommendations.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">{rec.title}</span>
                        <span className="text-xs text-gray-400">{rec.confidence}% confidence</span>
                        {rec.autoSetupAvailable && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/30">
                            Auto-setup
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-2">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">{rec.impact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">{rec.estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Add: {rec.integrations.join(', ')}</p>
                        <button
                          onClick={() => handleApplyRecommendation(rec.id)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          {rec.autoSetupAvailable && <Zap className="w-3 h-3" />}
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integrations List */}
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
                      {integration.autoAuthAvailable && (
                        <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                          Auto-Auth Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {integration.autoAuthAvailable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoAuth(integration.id)}
                      className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Auto-Auth
                    </Button>
                  )}
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
                  {integration.circuitBreakerStatus === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetCircuitBreaker(integration.id)}
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
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
              
              {/* Enhanced integration metrics */}
              {integration.usageMetrics && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Usage Metrics:</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Events/Day:</span>
                      <span className="ml-2 text-white font-mono">{integration.usageMetrics.eventsPerDay}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="ml-2 text-green-400 font-mono">{integration.usageMetrics.successRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Response:</span>
                      <span className="ml-2 text-blue-400 font-mono">{integration.usageMetrics.avgResponseTime}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Circuit Breaker Status */}
              {integration.circuitBreakerStatus && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Circuit Breaker:</div>
                  <div className="flex items-center gap-2">
                    {getCircuitBreakerIcon(integration.circuitBreakerStatus)}
                    <span className="text-xs capitalize">{integration.circuitBreakerStatus.replace('_', ' ')}</span>
                    {integration.retryAttempts && integration.retryAttempts > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {integration.retryAttempts} retries
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Compliance Status */}
              {integration.complianceStatus && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Compliance:</div>
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(integration.complianceStatus)}
                    <span className="text-xs capitalize">{integration.complianceStatus.replace('_', ' ')}</span>
                    {integration.dataResidency && (
                      <Badge variant="outline" className="text-xs">
                        {integration.dataResidency}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Version and Deprecation Info */}
              {integration.version && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Version Info:</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Version:</span>
                    <span className="text-white font-mono">{integration.version}</span>
                    {integration.deprecationDate && (
                      <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30">
                        Deprecates: {new Date(integration.deprecationDate).toLocaleDateString()}
                      </Badge>
                    )}
                    {integration.endOfLifeDate && (
                      <Badge variant="destructive" className="text-xs">
                        EOL: {new Date(integration.endOfLifeDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Last Error */}
              {integration.lastError && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Last Error:</div>
                  <div className="text-xs text-red-400 truncate" title={integration.lastError}>
                    {integration.lastError}
                  </div>
                </div>
              )}
              
              {/* Ecosystem connections */}
              {integration.ecosystemConnections && integration.ecosystemConnections.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Connected Ecosystem:</div>
                  <div className="flex flex-wrap gap-1">
                    {integration.ecosystemConnections.map((connection, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                        <Link2 className="w-3 h-3 mr-1" />
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
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
    </div>
  );
}
