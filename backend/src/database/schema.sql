-- Torqvio Database Schema
-- Durable Execution Platform

BEGIN;

-- Flow Definitions
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    definition JSONB NOT NULL,
    retry_policy JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow Executions
CREATE TABLE IF NOT EXISTS flow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_step_id VARCHAR(255),
    payload JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE
);

-- Step Results
CREATE TABLE IF NOT EXISTS step_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES flow_executions(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    output JSONB,
    error JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Unique constraint to prevent duplicate step executions
    UNIQUE(execution_id, step_id)
);

-- Events (Enhanced for event-driven architecture)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    source VARCHAR(255),
    flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
    execution_id UUID REFERENCES flow_executions(id) ON DELETE SET NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    correlation_id UUID,
    causation_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Triggers
CREATE TABLE IF NOT EXISTS triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    trigger_id VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations (Multi-tenancy support)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects (Multi-tenancy support)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    framework VARCHAR(50) DEFAULT 'dashboard',
    settings JSONB DEFAULT '{}',
    quotas JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Subscriptions
CREATE TABLE IF NOT EXISTS event_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    filter_config JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Execution Locks (for preventing concurrent execution of same flow)
CREATE TABLE IF NOT EXISTS execution_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES flow_executions(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Unique constraint to prevent double locking
    UNIQUE(execution_id, step_id)
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES flow_executions(id) ON DELETE CASCADE,
    step_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    level VARCHAR(20) DEFAULT 'info',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes after tables are created
CREATE INDEX IF NOT EXISTS idx_flow_executions_flow_id ON flow_executions(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_executions_status ON flow_executions(status);
CREATE INDEX IF NOT EXISTS idx_flow_executions_next_run_at ON flow_executions(next_run_at);
CREATE INDEX IF NOT EXISTS idx_flow_executions_created_at ON flow_executions(created_at);

CREATE INDEX IF NOT EXISTS idx_step_results_execution_id ON step_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_step_results_status ON step_results(status);
CREATE INDEX IF NOT EXISTS idx_step_results_step_id ON step_results(step_id);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events(processed);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_flow_id ON events(flow_id);
CREATE INDEX IF NOT EXISTS idx_events_execution_id ON events(execution_id);
-- Remove correlation_id index as column doesn't exist yet
-- CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);

CREATE INDEX IF NOT EXISTS idx_triggers_flow_id ON triggers(flow_id);
CREATE INDEX IF NOT EXISTS idx_triggers_type ON triggers(type);
CREATE INDEX IF NOT EXISTS idx_triggers_active ON triggers(active);

CREATE INDEX IF NOT EXISTS idx_webhooks_flow_id ON webhooks(flow_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);

CREATE INDEX IF NOT EXISTS idx_event_subscriptions_flow_id ON event_subscriptions(flow_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_type ON event_subscriptions(event_type);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_active ON event_subscriptions(active);
-- CREATE INDEX IF NOT EXISTS idx_event_subscriptions_project_id ON event_subscriptions(project_id);

CREATE INDEX IF NOT EXISTS idx_execution_locks_expires_at ON execution_locks(expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_execution_id ON audit_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_flows_updated_at ON flows;
DROP TRIGGER IF EXISTS update_flow_executions_updated_at ON flow_executions;
DROP TRIGGER IF EXISTS update_triggers_updated_at ON triggers;
DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_executions_updated_at BEFORE UPDATE ON flow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cleanup function for expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM execution_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- CLI System Tables
-- These tables support the CLI-based template deployment system

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
-- These will be added after tables are updated
-- CREATE INDEX IF NOT EXISTS idx_flows_project_id ON flows(project_id);
-- CREATE INDEX IF NOT EXISTS idx_webhooks_project_id ON webhooks(project_id);

-- Update timestamp triggers for new tables
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO flows (name, definition) VALUES 
-- ('test-flow', '{"steps": [{"id": "step1", "name": "test-step", "type": "function", "config": {}}]}');

-- Recovery Analytics Table
CREATE TABLE IF NOT EXISTS recovery_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    recovered_amount DECIMAL(10,2) DEFAULT 0,
    failure_amount DECIMAL(10,2) DEFAULT 0,
    recovery_rate DECIMAL(5,2) DEFAULT 0,
    retry_attempts INTEGER DEFAULT 0,
    successful_retries INTEGER DEFAULT 0,
    time_to_recovery_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Events Table (for real-time updates)
CREATE TABLE IF NOT EXISTS recovery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES flow_executions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'payment_failed', 'payment_recovered'
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    customer_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    recovery_attempt INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recovery_analytics_project_date ON recovery_analytics(project_id, date);
CREATE INDEX IF NOT EXISTS idx_recovery_events_project_created ON recovery_events(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_events_type ON recovery_events(event_type);

-- Counterfactual Analytics Table
CREATE TABLE IF NOT EXISTS counterfactual_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Actual Performance
    total_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    recovered_transactions INTEGER DEFAULT 0,
    recovered_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Counterfactual (What would have happened without Torqvio)
    baseline_failure_rate DECIMAL(5,4) DEFAULT 0,  -- Industry average or historical baseline
    counterfactual_failures INTEGER DEFAULT 0,     -- Projected failures without recovery
    counterfactual_loss DECIMAL(12,2) DEFAULT 0,   -- Projected loss without recovery
    prevented_loss DECIMAL(12,2) DEFAULT 0,        -- Money saved through intervention
    
    -- Efficiency Metrics
    recovery_efficiency_score DECIMAL(5,4) DEFAULT 0,  -- 0-1 score of recovery effectiveness
    confidence_score DECIMAL(5,4) DEFAULT 0,           -- Statistical confidence in projections
    intervention_impact DECIMAL(5,4) DEFAULT 0,       -- Impact score of Torqvio interventions
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, date)
);

-- Revenue Identity Timeline
CREATE TABLE IF NOT EXISTS revenue_identity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Milestone Events
    milestone_type VARCHAR(50) NOT NULL, -- 'first_recovery', 'prevented_loss_milestone', 'efficiency_breakthrough'
    milestone_value DECIMAL(12,2),
    milestone_description TEXT,
    
    -- Context
    cumulative_recovered DECIMAL(12,2) DEFAULT 0,
    cumulative_prevented_loss DECIMAL(12,2) DEFAULT 0,
    efficiency_score_at_milestone DECIMAL(5,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-tenant Identity Layer
CREATE TABLE IF NOT EXISTS tenant_identity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Revenue Identity Branding
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    revenue_tier VARCHAR(50), -- 'startup', 'smes', 'enterprise'
    
    -- Identity Metrics
    total_revenue_protected DECIMAL(15,2) DEFAULT 0,
    recovery_story TEXT, -- AI-generated narrative of their recovery journey
    trust_score DECIMAL(5,4) DEFAULT 0, -- 0-1 trust score based on consistency
    
    -- Preferences
    notification_preferences JSONB, -- LTV-framed vs basic notifications
    report_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
    branding_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id)
);

-- Shareable Reports Table
CREATE TABLE IF NOT EXISTS shareable_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for counterfactual analytics
CREATE INDEX IF NOT EXISTS idx_counterfactual_analytics_project_date ON counterfactual_analytics(project_id, date);
CREATE INDEX IF NOT EXISTS idx_counterfactual_analytics_confidence ON counterfactual_analytics(confidence_score);
CREATE INDEX IF NOT EXISTS idx_counterfactual_analytics_efficiency ON counterfactual_analytics(recovery_efficiency_score);

-- Indexes for revenue identity timeline
CREATE INDEX IF NOT EXISTS idx_revenue_identity_project ON revenue_identity_timeline(project_id);
CREATE INDEX IF NOT EXISTS idx_revenue_identity_milestone_type ON revenue_identity_timeline(milestone_type);
CREATE INDEX IF NOT EXISTS idx_revenue_identity_created_at ON revenue_identity_timeline(created_at);

-- Indexes for tenant identity
CREATE INDEX IF NOT EXISTS idx_tenant_identity_project ON tenant_identity(project_id);
CREATE INDEX IF NOT EXISTS idx_tenant_identity_industry ON tenant_identity(industry);
CREATE INDEX IF NOT EXISTS idx_tenant_identity_revenue_tier ON tenant_identity(revenue_tier);

-- Indexes for shareable reports
CREATE INDEX IF NOT EXISTS idx_shareable_reports_token ON shareable_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_shareable_reports_expires ON shareable_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_shareable_reports_project ON shareable_reports(project_id);

-- Update timestamp triggers for new tables
CREATE TRIGGER update_counterfactual_analytics_updated_at BEFORE UPDATE ON counterfactual_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_identity_updated_at BEFORE UPDATE ON tenant_identity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Integration Tables
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stripe', 'shopify', 'woocommerce', 'custom_api'
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- encrypted credentials
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255),
    event_type VARCHAR(100),
    raw_data JSONB,
    processed_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RBAC Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    tenant_id UUID REFERENCES tenant_identity(id),
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    duration_ms INTEGER,
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification Tables
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    achievement_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    points INTEGER NOT NULL,
    category VARCHAR(50),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    milestone_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shareable Reports Table
CREATE TABLE IF NOT EXISTS shareable_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    share_token VARCHAR(255) UNIQUE NOT NULL,
    report_data JSONB NOT NULL,
    options JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive Analytics Tables
CREATE TABLE IF NOT EXISTS failure_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    customer_id VARCHAR(255) NOT NULL,
    context JSONB NOT NULL,
    prediction JSONB NOT NULL,
    risk_score DECIMAL(5,4),
    risk_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    period VARCHAR(20) NOT NULL,
    recovery_rate DECIMAL(5,4),
    industry_average DECIMAL(5,4),
    top_quartile DECIMAL(5,4),
    percentile INTEGER,
    avg_recovery_time DECIMAL(10,2),
    revenue_protected DECIMAL(15,2),
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SLA Monitoring Tables
CREATE TABLE IF NOT EXISTS sla_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    period VARCHAR(20) NOT NULL,
    uptime_actual DECIMAL(5,4),
    uptime_target DECIMAL(5,4) DEFAULT 0.999,
    uptime_status VARCHAR(20),
    recovery_success_actual DECIMAL(5,4),
    recovery_success_target DECIMAL(5,4) DEFAULT 0.95,
    recovery_success_status VARCHAR(20),
    response_time_actual INTEGER,
    response_time_target INTEGER DEFAULT 500,
    response_time_status VARCHAR(20),
    error_rate_actual DECIMAL(5,4),
    error_rate_target DECIMAL(5,4) DEFAULT 0.001,
    error_rate_status VARCHAR(20),
    overall_sla DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sla_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_identity(id),
    metric_type VARCHAR(50) NOT NULL,
    actual_value DECIMAL(10,4),
    target_value DECIMAL(10,4),
    violation_duration INTEGER, -- minutes
    severity VARCHAR(20) DEFAULT 'medium',
    resolved_at TIMESTAMP WITH TIME ZONE,
    service_credits DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for integrations
CREATE INDEX IF NOT EXISTS idx_integrations_project_id ON integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- Indexes for integration events
CREATE INDEX IF NOT EXISTS idx_integration_events_integration_id ON integration_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_status ON integration_events(status);
CREATE INDEX IF NOT EXISTS idx_integration_events_created_at ON integration_events(created_at);

-- Indexes for users and RBAC
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_permission_logs_user_id ON permission_logs(user_id);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Indexes for gamification
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(milestone_type);

-- Indexes for predictive analytics
CREATE INDEX IF NOT EXISTS idx_failure_predictions_tenant_id ON failure_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_failure_predictions_customer_id ON failure_predictions(customer_id);
CREATE INDEX IF NOT EXISTS idx_failure_predictions_risk_score ON failure_predictions(risk_score);
CREATE INDEX IF NOT EXISTS idx_tenant_benchmarks_tenant_id ON tenant_benchmarks(tenant_id);

-- Indexes for SLA monitoring
CREATE INDEX IF NOT EXISTS idx_sla_metrics_tenant_id ON sla_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sla_violations_tenant_id ON sla_violations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sla_violations_resolved ON sla_violations(resolved_at);

-- Update timestamp triggers for new tables
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
