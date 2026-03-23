'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface WebhookConfigProps {
  integration: {
    id: string;
    type: string;
    webhookUrl?: string;
    events?: string[];
    availableEvents?: string[];
  };
  onUpdate: (updates: { webhookUrl?: string; events?: string[] }) => void;
  onTest?: () => void;
}

export function WebhookConfig({ integration, onUpdate, onTest }: WebhookConfigProps) {
  const [events, setEvents] = useState<string[]>(integration.events || []);
  const [isTesting, setIsTesting] = useState(false);

  const handleEventToggle = (event: string) => {
    const newEvents = events.includes(event)
      ? events.filter(e => e !== event)
      : [...events, event];
    
    setEvents(newEvents);
    onUpdate({ events: newEvents });
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest?.();
    } finally {
      setIsTesting(false);
    }
  };

  const getEventTypeLabel = (event: string) => {
    const labels: Record<string, string> = {
      'payment_intent.payment_failed': 'Payment Failed',
      'invoice.payment_failed': 'Invoice Failed',
      'customer.subscription.deleted': 'Subscription Cancelled',
      'payment_method.attached': 'Payment Method Added',
      'invoice.payment_succeeded': 'Payment Succeeded',
      'orders/paid': 'Order Paid',
      'orders/updated': 'Order Updated',
      'orders/cancelled': 'Order Cancelled',
      'checkouts/completed': 'Checkout Completed',
      'app/uninstalled': 'App Uninstalled'
    };
    return labels[event] || event;
  };

  const getEventTypeColor = (event: string) => {
    if (event.includes('failed') || event.includes('cancelled')) return 'destructive';
    if (event.includes('succeeded') || event.includes('paid') || event.includes('completed')) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Webhook Configuration</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {events.length} events selected
            </Badge>
            {integration.webhookUrl && (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="webhookUrl"
              value={integration.webhookUrl || ''}
              onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
              placeholder="https://your-api.torqvio.com/webhooks"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!integration.webhookUrl || isTesting}
            >
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This URL will receive webhook events from {integration.type}
          </p>
        </div>

        {integration.availableEvents && integration.availableEvents.length > 0 && (
          <div>
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {integration.availableEvents.map((event) => (
                <div key={event} className="flex items-center space-x-2 p-2 border rounded-lg">
                  <Checkbox
                    id={event}
                    checked={events.includes(event)}
                    onChange={() => handleEventToggle(event)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={event} className="text-sm font-medium">
                      {getEventTypeLabel(event)}
                    </Label>
                    <p className="text-xs text-gray-500">{event}</p>
                  </div>
                  <Badge variant={getEventTypeColor(event)} className="text-xs">
                    {event.includes('failed') || event.includes('cancelled') ? 'Critical' : 
                     event.includes('succeeded') || event.includes('paid') ? 'Success' : 'Info'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div>
            <Label>Selected Events</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {events.map((event) => (
                <Badge
                  key={event}
                  variant={getEventTypeColor(event)}
                  className="cursor-pointer"
                  onClick={() => handleEventToggle(event)}
                >
                  {getEventTypeLabel(event)}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => onUpdate({ events })}>
            Update Webhook Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
