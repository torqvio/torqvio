'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface IntegrationType {
  type: string;
  name: string;
  description: string;
  features: string[];
  configFields: Array<{
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
  }>;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
}

interface IntegrationFormProps {
  projectId: string;
  onSuccess?: (integration: Integration) => void;
  onCancel?: () => void;
}

export function IntegrationForm({ projectId, onSuccess, onCancel }: IntegrationFormProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [integrationName, setIntegrationName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supportedTypes, setSupportedTypes] = useState<IntegrationType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const { toast } = useToast();

  // Load supported integration types
  useState(() => {
    loadSupportedTypes();
  });

  const loadSupportedTypes = async () => {
    try {
      const response = await fetch('/api/v1/integrations/types/supported');
      const types = await response.json();
      setSupportedTypes(types);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Failed to Load Integration Types',
        message: 'Unable to fetch available integration types. Please refresh the page.'
      });
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const selectedTypeConfig = supportedTypes.find(t => t.type === selectedType);

  const handleConfigChange = (field: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [field]: value }));
  };

  const handleTest = async () => {
    if (!selectedType || !integrationName) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: integrationName,
          config: configValues,
          projectId
        })
      });

      if (response.ok) {
        const integration = await response.json();
        
        // Test the integration
        const testResponse = await fetch(`/api/v1/integrations/${integration.id}/test`, {
          method: 'POST'
        });

        const testResult = await testResponse.json();
        setTestResult(testResult);

        if (testResult.success) {
          onSuccess?.(integration);
        }
      } else {
        throw new Error('Failed to create integration');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast({
        type: 'error',
        title: 'Connection Test Failed',
        message: errorMessage
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedType || !integrationName) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: integrationName,
          config: configValues,
          projectId
        })
      });

      if (response.ok) {
        const integration = await response.json();
        onSuccess?.(integration);
      } else {
        throw new Error('Failed to create integration');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create integration';
      toast({
        type: 'error',
        title: 'Integration Creation Failed',
        message: errorMessage
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderConfigField = (field: IntegrationType['configFields'][0]) => {
    const value = configValues[field.name] || '';

    switch (field.type) {
      case 'password':
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            required={field.required}
          />
        );

      case 'url':
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder="https://example.com/webhook"
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleConfigChange(field.name, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            required={field.required}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Integration Type Selection */}
          <div>
            <Label htmlFor="integrationType">Integration Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                {supportedTypes.map((type) => (
                  <SelectItem key={type.type} value={type.type}>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Integration Type Details */}
          {selectedTypeConfig && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">{selectedTypeConfig.name}</div>
                  <div className="text-sm">{selectedTypeConfig.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTypeConfig.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Integration Name */}
          <div>
            <Label htmlFor="integrationName">Integration Name</Label>
            <Input
              id="integrationName"
              value={integrationName}
              onChange={(e) => setIntegrationName(e.target.value)}
              placeholder="My Stripe Integration"
              className="mt-2"
              required
            />
          </div>

          {/* Configuration Fields */}
          {selectedTypeConfig && (
            <div className="space-y-4">
              <Label>Configuration</Label>
              {selectedTypeConfig.configFields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="mt-2">
                    {renderConfigField(field)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!selectedType || !integrationName || isTesting || isCreating}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedType || !integrationName || isCreating || isTesting}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Integration'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
