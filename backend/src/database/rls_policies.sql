-- Enable RLS on all tenant-scoped tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Project-based access policies
CREATE POLICY tenant_isolation_projects ON projects
  FOR ALL TO authenticated_user
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_deployments ON deployments
  FOR ALL TO authenticated_user
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_flows ON flows
  FOR ALL TO authenticated_user
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_recovery_analytics ON recovery_analytics
  FOR ALL TO authenticated_user
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_integrations ON integrations
  FOR ALL TO authenticated_user
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Role-based access policies
CREATE POLICY admin_full_access ON projects
  FOR ALL TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') = 'admin'
  );

CREATE POLICY admin_full_access_deployments ON deployments
  FOR ALL TO authenticated_user
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    ) AND
    current_setting('app.user_role') = 'admin'
  );

CREATE POLICY admin_full_access_flows ON flows
  FOR ALL TO authenticated_user
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    ) AND
    current_setting('app.user_role') = 'admin'
  );

-- Manager-level policies
CREATE POLICY manager_access_projects ON projects
  FOR ALL TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') IN ('admin', 'manager')
  );

CREATE POLICY manager_access_workflows ON flows
  FOR ALL TO authenticated_user
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    ) AND
    current_setting('app.user_role') IN ('admin', 'manager')
  );

-- Analyst-level policies (read-only)
CREATE POLICY analyst_read_projects ON projects
  FOR SELECT TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') IN ('admin', 'manager', 'analyst')
  );

CREATE POLICY analyst_read_analytics ON recovery_analytics
  FOR SELECT TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') IN ('admin', 'manager', 'analyst')
  );

-- Viewer-level policies (read-only on most things)
CREATE POLICY viewer_read_projects ON projects
  FOR SELECT TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id
  );

CREATE POLICY viewer_read_flows ON flows
  FOR SELECT TO authenticated_user
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

-- Billing owner policies
CREATE POLICY billing_owner_access_billing ON recovery_analytics
  FOR ALL TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') IN ('admin', 'billing_owner')
  );

-- Integrator policies
CREATE POLICY integrator_access_integrations ON integrations
  FOR ALL TO authenticated_user
  USING (
    current_setting('app.current_tenant_id')::uuid = tenant_id AND
    current_setting('app.user_role') IN ('admin', 'manager', 'integrator')
  );

CREATE POLICY integrator_write_workflows ON flows
  FOR INSERT, UPDATE TO authenticated_user
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    ) AND
    current_setting('app.user_role') IN ('admin', 'manager', 'integrator')
  );
