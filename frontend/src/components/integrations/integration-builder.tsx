'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Globe, 
  Key, 
  Shield, 
  Zap,
  ArrowRight,
  Code,
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { 
  ConnectorFramework, 
  EndpointDefinition, 
  AuthenticationConfig, 
  TestResult,
  ValidationResult 
} from '@torqvio/client';

interface IntegrationBuilderProps {
  projectId: string;
  onIntegrationCreated?: (integration: any) => void;
  onCancel?: () => void;
}

export function IntegrationBuilder({ projectId, onIntegrationCreated, onCancel }: IntegrationBuilderProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState<EndpointDefinition[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  // Form state
  const [connectorConfig, setConnectorConfig] = useState<Partial<ConnectorFramework>>({
    definition: {
      name: '',
      version: '1.0.0',
      description: '',
      category: 'custom',
      tags: []
    },
    authentication: {
      type: 'api-key',
      configuration: {}
    },
    endpoints: {},
    rateLimiting: {
      default: {
        requestsPerSecond: 10,
        requestsPerMinute: 100
      },
      strategy: 'fixed',
      retryPolicy: {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        initialDelay: 1000,
        maxDelay: 10000,
        retryableErrors: ['500', '502', '503', '504']
      }
    },
    errorHandling: {
      retryPolicy: {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        initialDelay: 1000,
        maxDelay: 10000,
        retryableErrors: ['500', '502', '503', '504']
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringWindow: 300000
      },
      timeout: 30000,
      validation: {
        requestValidation: true,
        responseValidation: false,
        customValidators: []
      }
    },
    testing: {
      connectionTest: {
        endpoint: '/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000
      },
      endpointTests: [],
      scenarios: []
    }
  });

  // Discovery state
  const [discoveryConfig, setDiscoveryConfig] = useState({
    type: 'openapi' as 'openapi' | 'swagger' | 'manual',
    url: '',
    authentication: {
      type: 'none' as 'none' | 'api-key' | 'oauth2',
      apiKey: '',
      header: 'Authorization'
    },
    filter: {
      tags: [] as string[],
      paths: [] as string[],
      methods: [] as string[]
    }
  });

  // Manual endpoint state
  const [manualEndpoints, setManualEndpoints] = useState<EndpointDefinition[]>([]);

  useEffect(() => {
    if (discoveredEndpoints.length > 0) {
      const updatedConfig = { ...connectorConfig };
      updatedConfig.endpoints = {};
      discoveredEndpoints.forEach((endpoint, index) => {
        updatedConfig.endpoints[`endpoint_${index}`] = endpoint;
      });
      setConnectorConfig(updatedConfig);
    }
  }, [discoveredEndpoints]);

  const handleDiscoverEndpoints = async () => {
    if (!discoveryConfig.url) {
      toast({
        type: 'error',
        title: 'URL Required',
        message: 'Please enter a valid URL for endpoint discovery.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/integrations/builder/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: discoveryConfig.type,
          url: discoveryConfig.url,
          authentication: discoveryConfig.authentication.type !== 'none' ? {
            type: discoveryConfig.authentication.type,
            [discoveryConfig.authentication.type === 'api-key' ? 'apiKey' : 'oauth2']: {
              header: discoveryConfig.authentication.header,
              ...(discoveryConfig.authentication.type === 'api-key' && {
                value: discoveryConfig.authentication.apiKey
              })
            }
          } : undefined,
          filter: discoveryConfig.filter
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDiscoveredEndpoints(result.endpoints || []);
        toast({
          type: 'success',
          title: 'Discovery Complete',
          message: `Found ${result.endpoints?.length || 0} endpoints.`
        });
      } else {
        throw new Error('Discovery failed');
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Discovery Failed',
        message: error instanceof Error ? error.message : 'Failed to discover endpoints.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/integrations/builder/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectorConfig)
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
        
        if (result.valid) {
          toast({
            type: 'success',
            title: 'Configuration Valid',
            message: 'Your integration configuration is valid.'
          });
        } else {
          toast({
            type: 'error',
            title: 'Configuration Invalid',
            message: `Found ${result.errors.length} validation errors.`
          });
        }
      } else {
        throw new Error('Validation failed');
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Validation Failed',
        message: error instanceof Error ? error.message : 'Failed to validate configuration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!connectorConfig.testing?.connectionTest) {
      toast({
        type: 'error',
        title: 'No Connection Test',
        message: 'Please configure a connection test first.'
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/v1/integrations/builder/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: connectorConfig,
          test: connectorConfig.testing.connectionTest
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(prev => [result, ...prev.slice(0, 4)]);
        
        if (result.success) {
          toast({
            type: 'success',
            title: 'Connection Successful',
            message: 'The connection test passed successfully.'
          });
        } else {
          toast({
            type: 'error',
            title: 'Connection Failed',
            message: result.error || 'The connection test failed.'
          });
        }
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Test Failed',
        message: error instanceof Error ? error.message : 'Failed to run connection test.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateIntegration = async () => {
    // Validate first
    if (!connectorConfig.definition?.name) {
      toast({
        type: 'error',
        title: 'Name Required',
        message: 'Please provide a name for your integration.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // First validate
      const validationResponse = await fetch('/api/v1/integrations/builder/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectorConfig)
      });

      if (!validationResponse.ok) {
        throw new Error('Validation failed');
      }

      const validation = await validationResponse.json();
      if (!validation.valid) {
        toast({
          type: 'error',
          title: 'Configuration Invalid',
          message: 'Please fix validation errors before creating the integration.'
        });
        return;
      }

      // Package the connector
      const packageResponse = await fetch('/api/v1/integrations/builder/package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectorConfig)
      });

      if (!packageResponse.ok) {
        throw new Error('Packaging failed');
      }

      const packageResult = await packageResponse.json();

      // Create the integration
      const integrationResponse = await fetch('/api/v1/integrations/connectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...connectorConfig,
          packageId: packageResult.id,
          projectId
        })
      });

      if (integrationResponse.ok) {
        const integration = await integrationResponse.json();
        onIntegrationCreated?.(integration);
        
        toast({
          type: 'success',
          title: 'Integration Created',
          message: `"${connectorConfig.definition.name}" has been created successfully.`
        });
      } else {
        throw new Error('Integration creation failed');
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create integration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addManualEndpoint = () => {
    const newEndpoint: EndpointDefinition = {
      name: `endpoint_${manualEndpoints.length + 1}`,
      method: 'GET',
      path: '',
      parameters: [],
      response: {
        statusCode: 200,
        contentType: 'application/json',
        schema: {}
      },
      errorResponses: []
    };
    
    setManualEndpoints([...manualEndpoints, newEndpoint]);
  };

  const updateManualEndpoint = (index: number, field: keyof EndpointDefinition, value: any) => {
    const updated = [...manualEndpoints];
    updated[index] = { ...updated[index], [field]: value };
    setManualEndpoints(updated);
  };

  const removeManualEndpoint = (index: number) => {
    setManualEndpoints(manualEndpoints.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Builder</h2>
          <p className="text-gray-500">Create custom integrations with our visual builder</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateIntegration}
            disabled={isLoading || !connectorConfig.definition?.name}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Create Integration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="discovery">
            <Globe className="h-4 w-4 mr-2" />
            Discovery
          </TabsTrigger>
          <TabsTrigger value="authentication">
            <Key className="h-4 w-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Code className="h-4 w-4 mr-2" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="testing">
            <TestTube className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Endpoint Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Discovery Type</Label>
                  <Select 
                    value={discoveryConfig.type} 
                    onValueChange={(value: 'openapi' | 'swagger' | 'manual') => 
                      setDiscoveryConfig(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                      <SelectItem value="swagger">Swagger 2.0</SelectItem>
                      <SelectItem value="manual">Manual Configuration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>API URL</Label>
                  <Input
                    placeholder="https://api.example.com/docs.json"
                    value={discoveryConfig.url}
                    onChange={(e) => setDiscoveryConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
              </div>

              {discoveryConfig.type !== 'manual' && (
                <div className="space-y-4">
                  <div>
                    <Label>Authentication (Optional)</Label>
                    <Select 
                      value={discoveryConfig.authentication.type} 
                      onValueChange={(value: 'none' | 'api-key' | 'oauth2') => 
                        setDiscoveryConfig(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, type: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {discoveryConfig.authentication.type === 'api-key' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Header Name</Label>
                        <Input
                          placeholder="Authorization"
                          value={discoveryConfig.authentication.header}
                          onChange={(e) => setDiscoveryConfig(prev => ({
                            ...prev,
                            authentication: { ...prev.authentication, header: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          placeholder="your-api-key"
                          value={discoveryConfig.authentication.apiKey}
                          onChange={(e) => setDiscoveryConfig(prev => ({
                            ...prev,
                            authentication: { ...prev.authentication, apiKey: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {discoveryConfig.type !== 'manual' && (
                  <Button 
                    onClick={handleDiscoverEndpoints}
                    disabled={isLoading || !discoveryConfig.url}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
                    Discover Endpoints
                  </Button>
                )}
                {discoveryConfig.type === 'manual' && (
                  <Button onClick={addManualEndpoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </Button>
                )}
              </div>

              {/* Discovered Endpoints */}
              {(discoveredEndpoints.length > 0 || manualEndpoints.length > 0) && (
                <div className="space-y-2">
                  <Label>Endpoints Found</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(discoveryConfig.type === 'manual' ? manualEndpoints : discoveredEndpoints).map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <span className="font-mono text-sm">{endpoint.path}</span>
                          <span className="text-sm text-gray-500">{endpoint.name}</span>
                        </div>
                        {discoveryConfig.type === 'manual' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualEndpoint(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Authentication Type</Label>
                <Select 
                  value={connectorConfig.authentication?.type} 
                  onValueChange={(value: any) => 
                    setConnectorConfig(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, type: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-key">API Key</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {connectorConfig.authentication?.type === 'api-key' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Header Name</Label>
                    <Input
                      placeholder="X-API-Key"
                      value={connectorConfig.authentication.configuration?.apiKey?.header || ''}
                      onChange={(e) => setConnectorConfig(prev => ({
                        ...prev,
                        authentication: {
                          ...prev.authentication,
                          configuration: {
                            ...prev.authentication?.configuration,
                            apiKey: {
                              ...prev.authentication?.configuration?.apiKey,
                              header: e.target.value
                            }
                          }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Query Parameter (Optional)</Label>
                    <Input
                      placeholder="api_key"
                      value={connectorConfig.authentication.configuration?.apiKey?.queryParam || ''}
                      onChange={(e) => setConnectorConfig(prev => ({
                        ...prev,
                        authentication: {
                          ...prev.authentication,
                          configuration: {
                            ...prev.authentication?.configuration,
                            apiKey: {
                              ...prev.authentication?.configuration?.apiKey,
                              queryParam: e.target.value
                            }
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              )}

              {connectorConfig.authentication?.type === 'oauth2' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Authorization URL</Label>
                      <Input
                        placeholder="https://api.example.com/oauth/authorize"
                        value={connectorConfig.authentication.configuration?.oauth2?.authUrl || ''}
                        onChange={(e) => setConnectorConfig(prev => ({
                          ...prev,
                          authentication: {
                            ...prev.authentication,
                            configuration: {
                              ...prev.authentication?.configuration,
                              oauth2: {
                                ...prev.authentication?.configuration?.oauth2,
                                authUrl: e.target.value
                              }
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Token URL</Label>
                      <Input
                        placeholder="https://api.example.com/oauth/token"
                        value={connectorConfig.authentication.configuration?.oauth2?.tokenUrl || ''}
                        onChange={(e) => setConnectorConfig(prev => ({
                          ...prev,
                          authentication: {
                            ...prev.authentication,
                            configuration: {
                              ...prev.authentication?.configuration,
                              oauth2: {
                                ...prev.authentication?.configuration?.oauth2,
                                tokenUrl: e.target.value
                              }
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Scopes (comma-separated)</Label>
                    <Input
                      placeholder="read,write,admin"
                      value={connectorConfig.authentication.configuration?.oauth2?.scopes?.join(', ') || ''}
                      onChange={(e) => setConnectorConfig(prev => ({
                        ...prev,
                        authentication: {
                          ...prev.authentication,
                          configuration: {
                            ...prev.authentication?.configuration,
                            oauth2: {
                              ...prev.authentication?.configuration?.oauth2,
                              scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Endpoint Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Endpoints are automatically configured from discovery</p>
                <p className="text-sm text-gray-400 mt-2">Go to the Discovery tab to manage endpoints</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Integration Name</Label>
                  <Input
                    placeholder="My Custom Integration"
                    value={connectorConfig.definition?.name || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      definition: { ...prev.definition, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    placeholder="1.0.0"
                    value={connectorConfig.definition?.version || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      definition: { ...prev.definition, version: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this integration does..."
                  value={connectorConfig.definition?.description || ''}
                  onChange={(e) => setConnectorConfig(prev => ({
                    ...prev,
                    definition: { ...prev.definition, description: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={connectorConfig.definition?.category} 
                    onValueChange={(value) => 
                      setConnectorConfig(prev => ({
                        ...prev,
                        definition: { ...prev.definition, category: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="crm">CRM</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="api,rest,custom"
                    value={connectorConfig.definition?.tags?.join(', ') || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      definition: { 
                        ...prev.definition, 
                        tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleValidateConfiguration}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Validate
                </Button>
              </div>

              {validationResult && (
                <Alert className={validationResult.valid ? 'border-green-500' : 'border-red-500'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.valid ? (
                      <span className="text-green-700">Configuration is valid!</span>
                    ) : (
                      <div>
                        <span className="text-red-700 font-medium">Validation Errors:</span>
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error.field}: {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Connection Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Test Endpoint</Label>
                  <Input
                    placeholder="/health"
                    value={connectorConfig.testing?.connectionTest?.endpoint || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      testing: {
                        ...prev.testing,
                        connectionTest: {
                          ...prev.testing?.connectionTest,
                          endpoint: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Method</Label>
                  <Select 
                    value={connectorConfig.testing?.connectionTest?.method} 
                    onValueChange={(value: any) => 
                      setConnectorConfig(prev => ({
                        ...prev,
                        testing: {
                          ...prev.testing,
                          connectionTest: {
                            ...prev.testing?.connectionTest,
                            method: value
                          }
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Expected Status Code</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={connectorConfig.testing?.connectionTest?.expectedStatus || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      testing: {
                        ...prev.testing,
                        connectionTest: {
                          ...prev.testing?.connectionTest,
                          expectedStatus: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={connectorConfig.testing?.connectionTest?.timeout || ''}
                    onChange={(e) => setConnectorConfig(prev => ({
                      ...prev,
                      testing: {
                        ...prev.testing,
                        connectionTest: {
                          ...prev.testing?.connectionTest,
                          timeout: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleTestConnection}
                disabled={isTesting || !connectorConfig.testing?.connectionTest?.endpoint}
              >
                {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                Test Connection
              </Button>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Test Results</Label>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {result.success ? 'Success' : 'Failed'} - {result.duration}ms
                          </span>
                        </div>
                        {result.error && (
                          <span className="text-xs text-red-500">{result.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
