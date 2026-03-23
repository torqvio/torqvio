-- CLI System Tables Migration
-- These tables support the CLI-based template deployment system

-- Projects table for CLI-based project management
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    framework VARCHAR(50) DEFAULT 'cli',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments table for template deployments
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    template_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'deploying',
    webhook_url VARCHAR(500),
    environment JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update flows table to include project_id if not exists
ALTER TABLE flows ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Update webhooks table to include project_id if not exists
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_template_id ON deployments(template_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_flows_project_id ON flows(project_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_project_id ON webhooks(project_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample templates for testing
INSERT INTO templates (id, name, description, category, value_proposition, definition, created_at) VALUES
('payment-recovery', 'Stripe Payment Recovery', 'Never lose a payment due to temporary failures', 'payment', 'Recovers 95% of failed payments automatically', '{"triggers": [{"type": "webhook", "event": "payment_failed"}], "steps": [{"id": "validate_payment", "type": "validation"}, {"id": "retry_payment", "type": "retry", "config": {"max_attempts": 3}}]}', NOW()) ON CONFLICT (id) DO NOTHING,
('email-reliability', 'Email Delivery Assurance', 'Ensure critical emails always reach customers', 'email', '99.9% email delivery guarantee', '{"triggers": [{"type": "event", "event": "email.send.failed"}], "steps": [{"id": "retry_primary", "type": "retry", "config": {"max_attempts": 3}}]}', NOW()) ON CONFLICT (id) DO NOTHING,
('webhook-ingestion', 'Robust Webhook Processing', 'Never lose incoming webhook data', 'webhook', 'Zero webhook data loss', '{"triggers": [{"type": "webhook", "event": "webhook.received"}], "steps": [{"id": "validate_signature", "type": "validation"}, {"id": "store_data", "type": "storage"}]}', NOW()) ON CONFLICT (id) DO NOTHING;
