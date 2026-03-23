-- Update webhooks table to match documentation
-- This migration adds/updates the webhooks table structure

-- First, let's update the existing webhooks table to match the documented format
ALTER TABLE webhooks 
ADD COLUMN IF NOT EXISTS events TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;

-- Create a new webhooks table if it doesn't exist with the proper structure
-- This will be used instead of the triggers table for webhook management
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_url ON webhook_subscriptions(url);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events ON webhook_subscriptions USING GIN(events);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_next_retry ON webhook_subscriptions(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_webhook_subscriptions_updated_at 
    BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample webhook for testing
INSERT INTO webhook_subscriptions (url, events, secret, active)
VALUES (
    'https://example.com/webhooks/torqvio',
    ARRAY['workflow.started', 'workflow.completed', 'workflow.failed'],
    'test_webhook_secret_12345',
    true
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE webhook_subscriptions IS 'Webhook subscriptions for outgoing event notifications';
COMMENT ON COLUMN webhook_subscriptions.url IS 'Target URL for webhook delivery';
COMMENT ON COLUMN webhook_subscriptions.events IS 'Array of event types this webhook subscribes to';
COMMENT ON COLUMN webhook_subscriptions.secret IS 'Secret used for HMAC signature verification';
COMMENT ON COLUMN webhook_subscriptions.retry_count IS 'Current retry attempt count';
COMMENT ON COLUMN webhook_subscriptions.max_retries IS 'Maximum retry attempts before deactivation';
COMMENT ON COLUMN webhook_subscriptions.next_retry_at IS 'Timestamp for next retry attempt';
