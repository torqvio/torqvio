'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, FileText, Lock, Users, Database, AlertTriangle, Settings, Eye, EyeOff, Key, Clock, RefreshCw, Download, Upload, Search, Filter, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Compliance

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Compliance is essential for enterprise deployments of Torqvio. This guide covers compliance frameworks, audit requirements, data protection, and security standards including SOC 2, GDPR, HIPAA, and ISO 27001.

## Compliance Frameworks

### SOC 2 Compliance
\`\`\`bash
# Run SOC 2 compliance check
torqvio compliance check --framework soc2

# Generate SOC 2 report
torqvio compliance report --framework soc2 --format pdf

# Configure SOC 2 controls
torqvio compliance configure --framework soc2 --controls all
\`\`\`

#### SOC 2 Controls
\`\`\`yaml
# SOC 2 Type II Controls
soc2:
  security:
    - access_control: true
    - authentication: multi_factor
    - encryption: at_rest_and_in_transit
    - monitoring: 24x7
    
  availability:
    - uptime_sla: 99.9
    - backup_frequency: daily
    - disaster_recovery: tested
    - incident_response: documented
    
  processing_integrity:
    - data_validation: true
    - audit_logging: comprehensive
    - change_management: controlled
    - error_handling: documented
    
  confidentiality:
    - data_classification: implemented
    - need_to_know: enforced
    - ndas: signed
    - training: annual
\`\`\`

### GDPR Compliance
\`\`\`bash
# Configure GDPR settings
torqvio compliance configure --framework gdpr

# Generate GDPR documentation
torqvio compliance docs --framework gdpr --language en

# Data subject request handling
torqvio privacy dsr --type access --subject user@example.com
torqvio privacy dsr --type deletion --subject user@example.com
\`\`\`

#### GDPR Requirements
\`\`\`yaml
# GDPR Configuration
gdpr:
  lawful_basis:
    - consent: explicit
    - contract: necessary
    - legal_obligation: documented
    - legitimate_interest: assessed
    
  data_subject_rights:
    - access: automated
    - rectification: supported
    - erasure: right_to_be_forgotten
    - portability: json_format
    - objection: respected
    
  data_protection:
    - encryption: aes256
    - anonymization: automatic
    - retention_limits: enforced
    - breach_notification: 72h
    
  international_transfers:
    - adequacy_decisions: checked
    - standard_contractual_clauses: implemented
    - binding_corporate_rules: available
\`\`\`

### HIPAA Compliance
\`\`\`bash
# Enable HIPAA mode
torqvio compliance enable --framework hipaa

# Configure HIPAA settings
torqvio compliance configure --framework hipaa --baa_required true

# Generate HIPAA documentation
torqvio compliance docs --framework hipaa --include_baa true
\`\`\`

#### HIPAA Security Rules
\`\`\`yaml
# HIPAA Security Rule Implementation
hipaa:
  administrative_safeguards:
    - security_officer: appointed
    - workforce_training: annual
    - contingency_planning: documented
    - evaluation: periodic
    
  physical_safeguards:
    - facility_access: controlled
    - workstation_security: enforced
    - device_disposal: secure
    - media_controls: implemented
    
  technical_safeguards:
    - access_control: role_based
    - audit_controls: comprehensive
    - integrity_controls: checksums
    - transmission_security: tls
    
  breach_notification:
    - timeline: 60_days
    - notification: required
    - documentation: detailed
    - mitigation: immediate
\`\`\`

### ISO 27001
\`\`\`bash
# Implement ISO 27001 controls
torqvio compliance implement --framework iso27001

# Conduct risk assessment
torqvio security risk-assessment --framework iso27001

# Generate ISMS documentation
torqvio compliance isms --framework iso27001 --output isms/
\`\`\`

#### ISO 27001 Annex A Controls
\`\`\`yaml
# ISO 27001 Annex A Controls
iso27001:
  information_security_policies:
    - policy_documentation: complete
    - review_frequency: annual
    - approval: management
    
  organization_of_information_security:
    - roles_and_responsibilities: defined
    - segregation_of_duties: implemented
    - contact_with_authorities: established
    
  human_resource_security:
    - screening: background_checks
    - employment_terms: confidentiality
    - training: security_awareness
    - termination_process: documented
    
  asset_management:
    - inventory: maintained
    - classification: implemented
    - acceptable_use: defined
    - return_of_assets: procedure
    
  access_control:
    - user_access_management: formal
    - privileged_access: restricted
    - password_management: policy
    - remote_access: secure
    
  cryptography:
    - policy_on_cryptographic_controls: documented
    - key_management: secure
    - encryption_standards: enforced
    
  physical_and_environmental_security:
    - secure_areas: defined
    - equipment_security: implemented
    - clear_desk_screen: policy
    - utilities: resilient
    
  operations_security:
    - documented_procedures: operational
    - malware_protection: comprehensive
    - backup: regular_and_tested
    - logging: comprehensive
    
  communications_security:
    - network_security_controls: implemented
    - network_segregation: applied
    - transfer_policies: defined
    - messaging_security: encrypted
    
  system_acquisition_development_and_maintenance:
    - security_requirements: identified
    - development_security: secure_lifecycle
    - test_data: protection
    - change_management: controlled
    
  supplier_relationships:
    - supplier_policy: documented
    - agreements: security_included
    - supplier_monitoring: periodic
    
  information_security_incident_management:
    - response_procedures: documented
    - reporting_mechanisms: established
    - response_team: designated
    - lessons_learned: documented
    
  business_continuity_management:
    - business_impact_analysis: conducted
    - continuity_strategies: developed
    - plans_documented: comprehensive
    - testing: regular
    
  compliance:
    - legal_requirements: identified
    - compliance_reviews: periodic
    - intellectual_property: protected
    - privacy_protection: implemented
\`\`\`

## Data Protection

### Data Classification
\`\`\`bash
# Classify data
torqvio data classify --type sensitive --scope all

# Set retention policies
torqvio data retention --category personal --period 7y

# Enable data anonymization
torqvio data anonymize --enable --method differential_privacy
\`\`\`

#### Data Classification Framework
\`\`\`yaml
# Data Classification
data_classification:
  public:
    description: "Publicly available information"
    protection_level: minimal
    retention: permanent
    access_control: none
    
  internal:
    description: "Internal company information"
    protection_level: standard
    retention: 7y
    access_control: employees_only
    
  confidential:
    description: "Sensitive business information"
    protection_level: high
    retention: 5y
    access_control: need_to_know
    
  restricted:
    description: "Highly sensitive data"
    protection_level: maximum
    retention: 3y
    access_control: role_based
    encryption: required
    audit: comprehensive
\`\`\`

### Data Retention
\`\`\`bash
# Configure retention policies
torqvio data retention configure --policy legal_hold

# Apply retention to specific data
torqvio data retention apply --category logs --period 90d

# Automated data deletion
torqvio data cleanup --auto-delete --dry-run
\`\`\`

#### Retention Policies
\`\`\`yaml
# Data Retention Policies
retention_policies:
  audit_logs:
    period: 7y
    reason: "Regulatory compliance"
    auto_delete: true
    
  user_data:
    period: 5y
    reason: "Business requirement"
    auto_delete: true
    notification: 30d_before
    
  system_logs:
    period: 90d
    reason: "Operational need"
    auto_delete: true
    
  backups:
    period: 1y
    reason: "Disaster recovery"
    auto_delete: false
    encryption: required
    
  temporary_files:
    period: 7d
    reason: "System performance"
    auto_delete: true
    immediate: true
\`\`\`

## Audit and Monitoring

### Audit Trails
\`\`\`bash
# Enable comprehensive audit logging
torqvio audit enable --level comprehensive

# Generate audit report
torqvio audit report --period monthly --format pdf

# Export audit logs
torqvio audit export --from "2024-01-01" --to "2024-01-31" --format json
\`\`\`

#### Audit Configuration
\`\`\`yaml
# Audit Configuration
audit:
  enabled: true
  level: comprehensive
  
  events:
    authentication:
      - login_success
      - login_failure
      - password_change
      - mfa_challenge
      
    authorization:
      - permission_grant
      - permission_revoke
      - role_change
      - access_denied
      
    data_access:
      - read_operation
      - write_operation
      - delete_operation
      - export_operation
      
    system:
      - configuration_change
      - software_update
      - security_event
      - error_occurred
      
  storage:
    format: json
    compression: gzip
    encryption: aes256
    retention: 7y
    
  monitoring:
    real_time: true
    alerts: enabled
    dashboard: available
\`\`\`

### Compliance Monitoring
\`\`\`bash
# Monitor compliance status
torqvio compliance monitor --real-time

# Set up compliance alerts
torqvio compliance alert --type violation --channel email

# Generate compliance dashboard
torqvio compliance dashboard --export compliance.html
\`\`\`

## Risk Management

### Risk Assessment
\`\`\`bash
# Conduct risk assessment
torqvio security risk-assessment --framework iso27001

# Identify vulnerabilities
torqvio security scan --type vulnerability --detailed

# Risk treatment planning
torqvio security risk-treat --accept --mitigate --transfer --avoid
\`\`\`

#### Risk Management Framework
\`\`\`yaml
# Risk Management
risk_management:
  methodology: iso27005
  
  assessment_frequency: annual
  
  risk_categories:
    - strategic
    - operational
    - financial
    - compliance
    - reputational
    
  impact_levels:
    - negligible: 0-1
    - minor: 2-3
    - moderate: 4-6
    - major: 7-8
    - severe: 9-10
    
  likelihood_levels:
    - rare: <1%
    - unlikely: 1-10%
    - possible: 11-30%
    - likely: 31-70%
    - almost_certain: >70%
    
  treatment_options:
    - accept: for low risks
    - mitigate: for medium risks
    - transfer: for high risks
    - avoid: for severe risks
\`\`\`

## Documentation and Reporting

### Compliance Documentation
\`\`\`bash
# Generate compliance documentation
torqvio compliance docs --framework all --output docs/

# Create policy documents
torqvio compliance policy create --type security --template comprehensive

# Update documentation
torqvio compliance docs update --auto-sync
\`\`\`

### Reporting
\`\`\`bash
# Generate compliance reports
torqvio compliance report --framework soc2 --period quarterly

# Executive summary
torqvio compliance summary --format executive

# Technical compliance report
torqvio compliance report --framework gdpr --detailed
\`\`\`

## Third-Party Audits

### Audit Preparation
\`\`\`bash
# Prepare for audit
torqvio audit prepare --framework soc2 --audit-type type2

# Generate evidence packages
torqvio audit evidence --framework hipaa --export evidence/

# Audit readiness check
torqvio audit readiness --framework iso27001
\`\`\`

### Evidence Collection
\`\`\`yaml
# Evidence Collection
evidence_collection:
  categories:
    policies:
      - security_policy
      - acceptable_use_policy
      - incident_response_plan
      
    procedures:
      - access_control_procedures
      - backup_procedures
      - change_management_procedures
      
    records:
      - audit_logs
      - access_reviews
      - training_records
      
    technical:
      - system_configurations
      - network_diagrams
      - encryption_certificates
      
  collection_methods:
    - automated_collection: true
    - manual_verification: required
    - third_party_validation: available
    
  storage:
    - encrypted: true
    - tamper_evident: true
    - retention: 10y
    - access_control: restricted
\`\`\`

## Best Practices

### Compliance Checklist
\`\`\`yaml
# Compliance Checklist
checklist:
  governance:
    - policies_documented: true
    - procedures_established: true
    - roles_defined: true
    - training_conducted: true
    
  technical:
    - encryption_implemented: true
    - access_control_enforced: true
    - audit_logging_enabled: true
    - monitoring_active: true
    
  operational:
    - backup_regular: true
    - disaster_recovery_tested: true
    - incident_response_plan: true
    - vulnerability_scanning: true
    
  legal:
    - data_protection_officer: appointed
    - privacy_policy: published
    - consent_mechanisms: implemented
    - breach_procedures: documented
\`\`\`

### Continuous Compliance
\`\`\`bash
# Enable continuous compliance monitoring
torqvio compliance continuous --enable

# Automated compliance checks
torqvio compliance check --automated --schedule daily

# Compliance drift detection
torqvio compliance drift --alert-threshold 5%
\`\`\`

## Troubleshooting

### Compliance Issues
\`\`\`bash
# Diagnose compliance issues
torqvio compliance diagnose --framework soc2

# Fix common compliance problems
torqvio compliance fix --type access_control

# Validate compliance fixes
torqvio compliance validate --framework gdpr
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function CompliancePage() {
  return (
    <DocsPageWrapper copyForAIContent={MARKDOWN_CONTENT}>
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-white">Compliance</span>
          </li>
        </ol>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Compliance
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                advanced
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">30 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Comprehensive compliance guide covering SOC 2, GDPR, HIPAA, ISO 27001, data protection, audit requirements, and security standards for enterprise Torqvio deployments.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Compliance Frameworks */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <FileText className="w-6 h-6 text-purple-400" />
              Compliance Frameworks
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* SOC 2 Compliance */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">SOC 2 Compliance</h3>
                  <p className="text-gray-400">Achieve and maintain SOC 2 Type II compliance for security, availability, processing integrity, confidentiality, and privacy.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Enterprise</span>
                  <code className="text-purple-400 font-mono text-sm">soc2</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">SOC 2 Implementation</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Run SOC 2 compliance check
torqvio compliance check --framework soc2

# Generate SOC 2 report
torqvio compliance report --framework soc2 --format pdf

# Configure SOC 2 controls
torqvio compliance configure --framework soc2 --controls all`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* GDPR Compliance */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">GDPR Compliance</h3>
                  <p className="text-gray-400">Ensure GDPR compliance for data protection, privacy rights, and international data transfers.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Privacy</span>
                  <code className="text-purple-400 font-mono text-sm">gdpr</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">GDPR Configuration</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Configure GDPR settings
torqvio compliance configure --framework gdpr

# Generate GDPR documentation
torqvio compliance docs --framework gdpr --language en

# Data subject request handling
torqvio privacy dsr --type access --subject user@example.com
torqvio privacy dsr --type deletion --subject user@example.com`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Data Protection</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Data Classification</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Classify data
torqvio data classify --type sensitive --scope all

# Set retention policies
torqvio data retention --category personal --period 7y

# Enable data anonymization
torqvio data anonymize --enable --method differential_privacy`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Audit and Monitoring */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Eye className="w-6 h-6 text-purple-400" />
              Audit and Monitoring
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Audit Trails</h3>
                <p className="text-gray-400">Comprehensive audit logging and monitoring for compliance and security.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Audit</span>
                <code className="text-purple-400 font-mono text-sm">audit</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Audit Configuration</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Enable comprehensive audit logging
torqvio audit enable --level comprehensive

# Generate audit report
torqvio audit report --period monthly --format pdf

# Export audit logs
torqvio audit export --from "2024-01-01" --to "2024-01-31" --format json`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/deployment"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Deployment
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Deploy Torqvio with compliance and security best practices.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Deploy Compliantly →
              </div>
            </Link>

            <Link
              href="/docs/monitoring"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Monitoring
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Set up comprehensive monitoring for compliance and security.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Monitor Systems →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
