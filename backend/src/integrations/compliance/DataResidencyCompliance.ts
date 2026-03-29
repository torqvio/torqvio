import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface DataResidencyConfig {
  id: string;
  name: string;
  description: string;
  region: string;
  country: string;
  dataCenter: string;
  complianceFrameworks: ComplianceFramework[];
  dataRetention: DataRetentionConfig;
  encryption: EncryptionConfig;
  accessControl: AccessControlConfig;
  auditLogging: AuditLoggingConfig;
  dataClassification: DataClassificationConfig;
  crossBorderTransfer: CrossBorderTransferConfig;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  certificationDate?: Date;
  expiryDate?: Date;
  status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: 'data_protection' | 'privacy' | 'security' | 'retention' | 'access' | 'audit';
  mandatory: boolean;
  implementation: string;
  evidence: string[];
  lastVerified: Date;
  status: 'implemented' | 'partial' | 'not_implemented';
}

export interface DataRetentionConfig {
  defaultPeriod: number; // days
  byCategory: Record<string, number>;
  autoDeletion: boolean;
  legalHold: boolean;
  archivalPolicy: {
    enabled: boolean;
    period: number;
    storage: 'cold' | 'archive' | 'offline';
  };
}

export interface EncryptionConfig {
  inTransit: {
    enabled: boolean;
    algorithm: string;
    keyLength: number;
    certificateExpiry?: Date;
  };
  atRest: {
    enabled: boolean;
    algorithm: string;
    keyLength: number;
    keyRotation: number; // days
  };
  inMemory: {
    enabled: boolean;
    algorithm: string;
    keyManagement: 'manual' | 'automatic' | 'hsm';
  };
}

export interface AccessControlConfig {
  rbac: {
    enabled: boolean;
    roles: Role[];
    permissions: Permission[];
  };
  mfa: {
    required: boolean;
    methods: ('sms' | 'email' | 'totp' | 'hardware')[];
    exceptions: string[];
  };
  session: {
    timeout: number; // minutes
    maxConcurrent: number;
    ipRestriction: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  logLevel: 'basic' | 'detailed' | 'comprehensive';
  retention: number; // days
  events: AuditEvent[];
  storage: {
    location: string;
    encryption: boolean;
    immutable: boolean;
  };
  alerts: AuditAlert[];
}

export interface AuditEvent {
  category: 'access' | 'modification' | 'deletion' | 'export' | 'system';
  events: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  retention: number;
}

export interface AuditAlert {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'sms' | 'webhook' | 'slack')[];
  recipients: string[];
}

export interface DataClassificationConfig {
  levels: ClassificationLevel[];
  rules: ClassificationRule[];
  labeling: {
    automatic: boolean;
    required: boolean;
    metadata: string[];
  };
}

export interface ClassificationLevel {
  level: string;
  name: string;
  description: string;
  color: string;
  handling: HandlingInstructions;
  retention: number;
  encryption: boolean;
  access: string[];
}

export interface HandlingInstructions {
  storage: string;
  transmission: string;
  disposal: string;
  sharing: string;
}

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: 'classify' | 'flag' | 'block';
  level: string;
  active: boolean;
}

export interface RuleCondition {
  field: string;
  operator: 'contains' | 'equals' | 'regex' | 'greater_than' | 'less_than';
  value: string | number;
  caseSensitive: boolean;
}

export interface CrossBorderTransferConfig {
  allowed: boolean;
  destinations: TransferDestination[];
  mechanisms: TransferMechanism[];
  consent: {
    required: boolean;
    method: 'explicit' | 'implicit' | 'none';
    duration: number; // days
  };
  monitoring: {
    enabled: boolean;
    alerts: boolean;
    logging: boolean;
  };
}

export interface TransferDestination {
  country: string;
  region: string;
  allowed: boolean;
  mechanism: string[];
  restrictions: string[];
}

export interface TransferMechanism {
  name: string;
  type: 'adequacy' | 'sccs' | 'bcrs' | 'derogation';
  description: string;
  approved: boolean;
  expiryDate?: Date;
}

export interface ComplianceReport {
  id: string;
  configId: string;
  framework: string;
  period: {
    from: Date;
    to: Date;
  };
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number; // 0-100
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedAt: Date;
  nextReview: Date;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  remediation: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

export class DataResidencyCompliance {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
    this.seedDefaultConfigurations();
  }

  private async initializeTables(): Promise<void> {
    // Data residency configurations
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS data_residency_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        region VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        data_center VARCHAR(200),
        compliance_frameworks JSONB NOT NULL,
        data_retention JSONB NOT NULL,
        encryption JSONB NOT NULL,
        access_control JSONB NOT NULL,
        audit_logging JSONB NOT NULL,
        data_classification JSONB NOT NULL,
        cross_border_transfer JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Compliance reports
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS compliance_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID REFERENCES data_residency_configs(id) ON DELETE CASCADE,
        framework VARCHAR(100) NOT NULL,
        period_from DATE NOT NULL,
        period_to DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
        findings JSONB NOT NULL,
        recommendations TEXT[],
        generated_at TIMESTAMP DEFAULT NOW(),
        next_review DATE
      );
    `);

    // Audit logs
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS compliance_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID REFERENCES data_residency_configs(id) ON DELETE CASCADE,
        event_category VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        resource_id VARCHAR(255),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        severity VARCHAR(20) DEFAULT 'medium'
      );
    `);

    // Data classification records
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS data_classifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID REFERENCES data_residency_configs(id) ON DELETE CASCADE,
        resource_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        classification_level VARCHAR(50) NOT NULL,
        confidence DECIMAL(3,2) DEFAULT 1.0,
        applied_at TIMESTAMP DEFAULT NOW(),
        applied_by VARCHAR(255),
        metadata JSONB
      );
    `);

    // Create indexes
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_data_residency_configs_active ON data_residency_configs(is_active)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_compliance_reports_config_framework ON compliance_reports(config_id, framework)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_timestamp ON compliance_audit_logs(timestamp)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_data_classifications_resource ON data_classifications(resource_id, resource_type)');
  }

  private async seedDefaultConfigurations(): Promise<void> {
    // GDPR Configuration for EU
    await this.createConfig({
      name: 'GDPR EU Configuration',
      description: 'GDPR compliance configuration for EU data residency',
      region: 'EU',
      country: 'Germany',
      dataCenter: 'eu-central-1',
      complianceFrameworks: [
        {
          name: 'GDPR',
          version: '2018/50',
          requirements: [
            {
              id: 'gdpr_art_32',
              name: 'Security of Processing',
              description: 'Implement appropriate technical and organizational measures',
              category: 'security',
              mandatory: true,
              implementation: 'Encryption, access controls, audit logging',
              evidence: ['encryption_config', 'access_control_logs', 'security_audit'],
              lastVerified: new Date(),
              status: 'implemented'
            },
            {
              id: 'gdpr_art_25',
              name: 'Data Protection by Design',
              description: 'Implement data protection measures by design',
              category: 'data_protection',
              mandatory: true,
              implementation: 'Data classification, minimal data collection',
              evidence: ['classification_rules', 'data_minimization_policy'],
              lastVerified: new Date(),
              status: 'implemented'
            }
          ],
          certificationDate: new Date('2023-01-01'),
          expiryDate: new Date('2026-01-01'),
          status: 'compliant'
        }
      ],
      dataRetention: {
        defaultPeriod: 2555, // 7 years
        byCategory: {
          'personal_data': 2555,
          'financial_data': 3650, // 10 years
          'marketing_data': 730, // 2 years
          'system_logs': 90
        },
        autoDeletion: true,
        legalHold: true,
        archivalPolicy: {
          enabled: true,
          period: 3650,
          storage: 'cold'
        }
      },
      encryption: {
        inTransit: {
          enabled: true,
          algorithm: 'TLS-1.3',
          keyLength: 256,
          certificateExpiry: new Date('2025-01-01')
        },
        atRest: {
          enabled: true,
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          keyRotation: 90
        },
        inMemory: {
          enabled: true,
          algorithm: 'AES-256',
          keyManagement: 'automatic'
        }
      },
      accessControl: {
        rbac: {
          enabled: true,
          roles: [
            {
              id: 'data_admin',
              name: 'Data Administrator',
              description: 'Full access to data management',
              permissions: ['data.read', 'data.write', 'data.delete', 'data.classify'],
              isSystem: false
            },
            {
              id: 'data_analyst',
              name: 'Data Analyst',
              description: 'Read-only access to anonymized data',
              permissions: ['data.read.anonymized'],
              isSystem: false
            }
          ],
          permissions: [
            {
              id: 'data.read',
              name: 'Read Data',
              resource: 'data',
              action: 'read',
              description: 'Read access to data'
            },
            {
              id: 'data.write',
              name: 'Write Data',
              resource: 'data',
              action: 'write',
              description: 'Write access to data'
            }
          ]
        },
        mfa: {
          required: true,
          methods: ['totp', 'hardware'],
          exceptions: ['service_accounts']
        },
        session: {
          timeout: 30,
          maxConcurrent: 3,
          ipRestriction: true
        }
      },
      auditLogging: {
        enabled: true,
        logLevel: 'comprehensive',
        retention: 2555,
        events: [
          {
            category: 'access',
            events: ['login', 'data_access', 'permission_change'],
            severity: 'medium',
            retention: 2555
          },
          {
            category: 'modification',
            events: ['data_create', 'data_update', 'data_delete'],
            severity: 'high',
            retention: 2555
          }
        ],
        storage: {
          location: 'secure-audit-storage',
          encryption: true,
          immutable: true
        },
        alerts: [
          {
            name: 'Unauthorized Access Attempt',
            condition: 'event_type = unauthorized_access',
            severity: 'critical',
            channels: ['email', 'slack'],
            recipients: ['security@company.com']
          }
        ]
      },
      dataClassification: {
        levels: [
          {
            level: 'public',
            name: 'Public',
            description: 'Information that can be freely shared',
            color: '#28a745',
            handling: {
              storage: 'standard',
              transmission: 'unencrypted',
              disposal: 'standard',
              sharing: 'unrestricted'
            },
            retention: 0,
            encryption: false,
            access: ['all']
          },
          {
            level: 'confidential',
            name: 'Confidential',
            description: 'Sensitive business information',
            color: '#ffc107',
            handling: {
              storage: 'encrypted',
              transmission: 'encrypted',
              disposal: 'secure',
              sharing: 'internal_only'
            },
            retention: 2555,
            encryption: true,
            access: ['employees', 'contractors']
          },
          {
            level: 'restricted',
            name: 'Restricted',
            description: 'Highly sensitive personal or financial data',
            color: '#dc3545',
            handling: {
              storage: 'encrypted_high',
              transmission: 'encrypted_high',
              disposal: 'secure_erase',
              sharing: 'authorized_only'
            },
            retention: 2555,
            encryption: true,
            access: ['authorized_personnel']
          }
        ],
        rules: [
          {
            id: 'pii_detector',
            name: 'PII Detection',
            description: 'Detect and classify personally identifiable information',
            conditions: [
              { field: 'content', operator: 'regex', value: '\\b\\d{3}-\\d{2}-\\d{4}\\b', caseSensitive: false }, // SSN
              { field: 'content', operator: 'regex', value: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', caseSensitive: false } // Email
            ],
            action: 'classify',
            level: 'restricted',
            active: true
          }
        ],
        labeling: {
          automatic: true,
          required: true,
          metadata: ['classification_level', 'classification_confidence']
        }
      },
      crossBorderTransfer: {
        allowed: false,
        destinations: [
          {
            country: 'US',
            region: 'North America',
            allowed: false,
            mechanism: [],
            restrictions: ['gdpr_incompatibility']
          }
        ],
        mechanisms: [
          {
            name: 'Standard Contractual Clauses',
            type: 'sccs',
            description: 'EU Commission Standard Contractual Clauses',
            approved: true,
            expiryDate: new Date('2025-12-31')
          }
        ],
        consent: {
          required: true,
          method: 'explicit',
          duration: 365
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: true
        }
      },
      isActive: true,
      priority: 10
    });

    // HIPAA Configuration for US Healthcare
    await this.createConfig({
      name: 'HIPAA US Healthcare Configuration',
      description: 'HIPAA compliance configuration for US healthcare data',
      region: 'US',
      country: 'United States',
      dataCenter: 'us-east-1',
      complianceFrameworks: [
        {
          name: 'HIPAA',
          version: '2013',
          requirements: [
            {
              id: 'hipaa_security_164.312',
              name: 'Technical Safeguards',
              description: 'Implement technical security measures',
              category: 'security',
              mandatory: true,
              implementation: 'Access controls, audit controls, integrity controls',
              evidence: ['access_controls', 'audit_logs', 'integrity_checks'],
              lastVerified: new Date(),
              status: 'implemented'
            }
          ],
          status: 'compliant'
        }
      ],
      dataRetention: {
        defaultPeriod: 2190, // 6 years
        byCategory: {
          'phi': 2190,
          'medical_records': 2190,
          'billing_records': 2555, // 7 years
          'audit_logs': 2555
        },
        autoDeletion: false,
        legalHold: true,
        archivalPolicy: {
          enabled: true,
          period: 2555,
          storage: 'archive'
        }
      },
      encryption: {
        inTransit: {
          enabled: true,
          algorithm: 'TLS-1.2',
          keyLength: 256
        },
        atRest: {
          enabled: true,
          algorithm: 'AES-256',
          keyLength: 256,
          keyRotation: 180
        },
        inMemory: {
          enabled: true,
          algorithm: 'AES-256',
          keyManagement: 'hsm'
        }
      },
      accessControl: {
        rbac: {
          enabled: true,
          roles: [
            {
              id: 'hipaa_admin',
              name: 'HIPAA Administrator',
              description: 'Full HIPAA compliance access',
              permissions: ['phi.read', 'phi.write', 'phi.audit'],
              isSystem: false
            }
          ],
          permissions: [
            {
              id: 'phi.read',
              name: 'Read PHI',
              resource: 'phi',
              action: 'read',
              description: 'Read access to Protected Health Information'
            }
          ]
        },
        mfa: {
          required: true,
          methods: ['totp', 'hardware'],
          exceptions: []
        },
        session: {
          timeout: 15,
          maxConcurrent: 1,
          ipRestriction: true
        }
      },
      auditLogging: {
        enabled: true,
        logLevel: 'comprehensive',
        retention: 2555,
        events: [
          {
            category: 'access',
            events: ['phi_access', 'login', 'permission_change'],
            severity: 'high',
            retention: 2555
          }
        ],
        storage: {
          location: 'hipaa-audit-storage',
          encryption: true,
          immutable: true
        },
        alerts: []
      },
      dataClassification: {
        levels: [
          {
            level: 'phi',
            name: 'Protected Health Information',
            description: 'HIPAA protected health information',
            color: '#dc3545',
            handling: {
              storage: 'encrypted_hipaa',
              transmission: 'encrypted_hipaa',
              disposal: 'secure_erase_hipaa',
              sharing: 'authorized_hipaa'
            },
            retention: 2190,
            encryption: true,
            access: ['covered_entities', 'business_associates']
          }
        ],
        rules: [
          {
            id: 'phi_detector',
            name: 'PHI Detection',
            description: 'Detect and classify PHI data',
            conditions: [
              { field: 'content', operator: 'regex', value: '\\b\\d{2}-\\d{2}-\\d{4}\\b', caseSensitive: false } // DOB pattern
            ],
            action: 'classify',
            level: 'phi',
            active: true
          }
        ],
        labeling: {
          automatic: true,
          required: true,
          metadata: ['phi_level', 'hipaa_compliance']
        }
      },
      crossBorderTransfer: {
        allowed: false,
        destinations: [],
        mechanisms: [],
        consent: {
          required: true,
          method: 'explicit',
          duration: 0
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: true
        }
      },
      isActive: true,
      priority: 9
    });
  }

  async createConfig(config: Omit<DataResidencyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataResidencyConfig> {
    const result = await this.db.query(`
      INSERT INTO data_residency_configs (
        name, description, region, country, data_center, compliance_frameworks,
        data_retention, encryption, access_control, audit_logging, data_classification,
        cross_border_transfer, is_active, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      config.name,
      config.description,
      config.region,
      config.country,
      config.dataCenter,
      JSON.stringify(config.complianceFrameworks),
      JSON.stringify(config.dataRetention),
      JSON.stringify(config.encryption),
      JSON.stringify(config.accessControl),
      JSON.stringify(config.auditLogging),
      JSON.stringify(config.dataClassification),
      JSON.stringify(config.crossBorderTransfer),
      config.isActive,
      config.priority
    ]);

    return this.mapDbRowToConfig(result[0]);
  }

  async getConfig(configId: string): Promise<DataResidencyConfig | null> {
    const result = await this.db.query(`
      SELECT * FROM data_residency_configs WHERE id = $1 AND is_active = true
    `, [configId]);

    return result.length > 0 ? this.mapDbRowToConfig(result[0]) : null;
  }

  async getConfigsByRegion(region: string): Promise<DataResidencyConfig[]> {
    const result = await this.db.query(`
      SELECT * FROM data_residency_configs 
      WHERE region = $1 AND is_active = true 
      ORDER BY priority DESC, created_at DESC
    `, [region]);

    return result.map(row => this.mapDbRowToConfig(row));
  }

  async classifyData(
    configId: string,
    resourceId: string,
    resourceType: string,
    data: any,
    userId?: string
  ): Promise<string> {
    const config = await this.getConfig(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Apply classification rules
    for (const rule of config.dataClassification.rules) {
      if (!rule.active) continue;

      let matches = true;
      for (const condition of rule.conditions) {
        if (!this.evaluateCondition(data, condition)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Store classification
        await this.storeClassification(configId, resourceId, resourceType, rule.level, userId);
        
        // Log classification event
        await this.logAuditEvent(configId, 'classification', 'data_classified', userId, resourceId, {
          level: rule.level,
          rule: rule.name,
          confidence: 1.0
        });

        return rule.level;
      }
    }

    // Default classification if no rules match
    const defaultLevel = config.dataClassification.levels[0]?.level || 'public';
    await this.storeClassification(configId, resourceId, resourceType, defaultLevel, userId);
    
    return defaultLevel;
  }

  private evaluateCondition(data: any, condition: RuleCondition): boolean {
    const value = this.getNestedValue(data, condition.field);
    
    if (value === null || value === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'equals':
        return String(value) === String(condition.value);
      case 'regex':
        return new RegExp(String(condition.value), condition.caseSensitive ? 'g' : 'gi').test(String(value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private async storeClassification(
    configId: string,
    resourceId: string,
    resourceType: string,
    level: string,
    userId?: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO data_classifications (config_id, resource_id, resource_type, classification_level, applied_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (config_id, resource_id) DO UPDATE SET
        classification_level = EXCLUDED.classification_level,
        applied_at = NOW(),
        applied_by = EXCLUDED.applied_by
    `, [configId, resourceId, resourceType, level, userId]);
  }

  async logAuditEvent(
    configId: string,
    category: string,
    eventType: string,
    userId?: string,
    resourceId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO compliance_audit_logs (
        config_id, event_category, event_type, user_id, resource_id, details, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      configId,
      category,
      eventType,
      userId,
      resourceId,
      JSON.stringify(details),
      ipAddress,
      userAgent
    ]);
  }

  async generateComplianceReport(
    configId: string,
    framework: string,
    period: { from: Date; to: Date }
  ): Promise<ComplianceReport> {
    const config = await this.getConfig(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    const frameworkConfig = config.complianceFrameworks.find(f => f.name === framework);
    if (!frameworkConfig) {
      throw new Error('Framework not found in configuration');
    }

    // Calculate compliance score
    const totalRequirements = frameworkConfig.requirements.length;
    const implementedRequirements = frameworkConfig.requirements.filter(r => r.status === 'implemented').length;
    const score = Math.round((implementedRequirements / totalRequirements) * 100);

    // Generate findings
    const findings: ComplianceFinding[] = frameworkConfig.requirements
      .filter(r => r.status !== 'implemented')
      .map(r => ({
        id: uuidv4(),
        category: r.category,
        severity: r.mandatory ? 'high' as const : 'medium' as const,
        description: `Requirement not implemented: ${r.name}`,
        evidence: r.evidence,
        remediation: r.implementation,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'open' as const
      }));

    const report: ComplianceReport = {
      id: uuidv4(),
      configId,
      framework,
      period,
      status: score >= 90 ? 'compliant' : score >= 70 ? 'partial' : 'non_compliant',
      score,
      findings,
      recommendations: this.generateRecommendations(findings),
      generatedAt: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    };

    // Store report
    await this.db.query(`
      INSERT INTO compliance_reports (
        id, config_id, framework, period_from, period_to, status, score,
        findings, recommendations, generated_at, next_review
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      report.id,
      report.configId,
      report.framework,
      report.period.from.toISOString().split('T')[0],
      report.period.to.toISOString().split('T')[0],
      report.status,
      report.score.toString(),
      JSON.stringify(report.findings),
      report.recommendations,
      report.generatedAt,
      report.nextReview
    ]);

    return report;
  }

  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = [];

    findings.forEach(finding => {
      switch (finding.category) {
        case 'security':
          recommendations.push('Enhance security measures and implement additional controls');
          break;
        case 'privacy':
          recommendations.push('Review and update privacy policies and procedures');
          break;
        case 'data_protection':
          recommendations.push('Implement data protection by design principles');
          break;
        default:
          recommendations.push(`Address ${finding.category} requirements: ${finding.remediation}`);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  async getComplianceReports(configId: string, framework?: string): Promise<ComplianceReport[]> {
    let query = `
      SELECT * FROM compliance_reports 
      WHERE config_id = $1
    `;
    const params = [configId];

    if (framework) {
      query += ` AND framework = $2`;
      params.push(framework);
    }

    query += ` ORDER BY generated_at DESC`;

    const result = await this.db.query(query, params);
    
    return result.map(row => ({
      id: row.id,
      configId: row.config_id,
      framework: row.framework,
      period: {
        from: new Date(row.period_from),
        to: new Date(row.period_to)
      },
      status: row.status,
      score: parseInt(row.score),
      findings: row.findings,
      recommendations: row.recommendations,
      generatedAt: row.generated_at,
      nextReview: row.next_review
    }));
  }

  async getDataRetentionSchedule(configId: string): Promise<Record<string, number>> {
    const config = await this.getConfig(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    return {
      default: config.dataRetention.defaultPeriod,
      ...config.dataRetention.byCategory
    };
  }

  async checkCrossBorderTransfer(
    configId: string,
    destinationCountry: string,
    consent?: boolean
  ): Promise<{ allowed: boolean; mechanism?: string; restrictions?: string[] }> {
    const config = await this.getConfig(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    const transferConfig = config.crossBorderTransfer;
    
    if (!transferConfig.allowed) {
      return { allowed: false, restrictions: ['Cross-border transfers not allowed'] };
    }

    const destination = transferConfig.destinations.find(d => d.country === destinationCountry);
    if (!destination || !destination.allowed) {
      return { 
        allowed: false, 
        restrictions: destination?.restrictions || ['Destination not approved'] 
      };
    }

    if (transferConfig.consent.required && !consent) {
      return { 
        allowed: false, 
        restrictions: ['Explicit consent required for cross-border transfer'] 
      };
    }

    return {
      allowed: true,
      mechanism: destination.mechanism[0],
      restrictions: destination.restrictions
    };
  }

  private mapDbRowToConfig(row: any): DataResidencyConfig {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      region: row.region,
      country: row.country,
      dataCenter: row.data_center,
      complianceFrameworks: row.compliance_frameworks,
      dataRetention: row.data_retention,
      encryption: row.encryption,
      accessControl: row.access_control,
      auditLogging: row.audit_logging,
      dataClassification: row.data_classification,
      crossBorderTransfer: row.cross_border_transfer,
      isActive: row.is_active,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getAuditLogs(
    configId: string,
    filters?: {
      category?: string;
      eventType?: string;
      userId?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    }
  ): Promise<any[]> {
    let query = `
      SELECT * FROM compliance_audit_logs 
      WHERE config_id = $1
    `;
    const params = [configId];

    if (filters?.category) {
      query += ` AND event_category = $${params.length + 1}`;
      params.push(filters.category);
    }

    if (filters?.eventType) {
      query += ` AND event_type = $${params.length + 1}`;
      params.push(filters.eventType);
    }

    if (filters?.userId) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(filters.userId);
    }

    if (filters?.from) {
      query += ` AND timestamp >= $${params.length + 1}`;
      params.push(filters.from.toISOString());
    }

    if (filters?.to) {
      query += ` AND timestamp <= $${params.length + 1}`;
      params.push(filters.to.toISOString());
    }

    query += ` ORDER BY timestamp DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit.toString());
    }

    const result = await this.db.query(query, params);
    return result;
  }

  async getDataClassifications(
    configId: string,
    resourceId?: string,
    resourceType?: string
  ): Promise<any[]> {
    let query = `
      SELECT * FROM data_classifications 
      WHERE config_id = $1
    `;
    const params = [configId];

    if (resourceId) {
      query += ` AND resource_id = $${params.length + 1}`;
      params.push(resourceId);
    }

    if (resourceType) {
      query += ` AND resource_type = $${params.length + 1}`;
      params.push(resourceType);
    }

    query += ` ORDER BY applied_at DESC`;

    const result = await this.db.query(query, params);
    return result;
  }
}
