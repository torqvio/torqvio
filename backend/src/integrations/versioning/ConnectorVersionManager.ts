import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface ConnectorVersion {
  id: string;
  connectorType: string;
  version: string;
  status: 'active' | 'deprecated' | 'unsupported';
  deprecationDate?: Date;
  endOfLifeDate?: Date;
  migrationPath?: string;
  breakingChanges: string[];
  features: string[];
  apiVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeprecationPolicy {
  noticePeriodDays: number;
  endOfLifePeriodDays: number;
  autoMigrationEnabled: boolean;
  notificationChannels: string[];
  gracePeriodFeatures: string[];
}

export interface VersionCompatibility {
  fromVersion: string;
  toVersion: string;
  compatibility: 'full' | 'partial' | 'breaking';
  migrationRequired: boolean;
  migrationScript?: string;
  notes: string[];
}

export class ConnectorVersionManager {
  private db: DatabaseConnection;
  private defaultPolicy: DeprecationPolicy = {
    noticePeriodDays: 90,
    endOfLifePeriodDays: 180,
    autoMigrationEnabled: true,
    notificationChannels: ['email', 'in_app', 'webhook'],
    gracePeriodFeatures: ['core_functionality', 'webhooks']
  };

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_type VARCHAR(100) NOT NULL,
        version VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        deprecation_date TIMESTAMP,
        end_of_life_date TIMESTAMP,
        migration_path TEXT,
        breaking_changes TEXT[],
        features TEXT[],
        api_version VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(connector_type, version)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS version_compatibility (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_type VARCHAR(100) NOT NULL,
        from_version VARCHAR(50) NOT NULL,
        to_version VARCHAR(50) NOT NULL,
        compatibility VARCHAR(20) NOT NULL,
        migration_required BOOLEAN DEFAULT false,
        migration_script TEXT,
        notes TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS deprecation_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_type VARCHAR(100) NOT NULL,
        notice_period_days INTEGER DEFAULT 90,
        end_of_life_period_days INTEGER DEFAULT 180,
        auto_migration_enabled BOOLEAN DEFAULT true,
        notification_channels TEXT[] DEFAULT ARRAY['email', 'in_app'],
        grace_period_features TEXT[] DEFAULT ARRAY['core_functionality'],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  async registerVersion(version: Omit<ConnectorVersion, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorVersion> {
    const result = await this.db.query(`
      INSERT INTO connector_versions (
        connector_type, version, status, deprecation_date, end_of_life_date,
        migration_path, breaking_changes, features, api_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      version.connectorType,
      version.version,
      version.status,
      version.deprecationDate,
      version.endOfLifeDate,
      version.migrationPath,
      version.breakingChanges,
      version.features,
      version.apiVersion
    ]);

    return result[0];
  }

  async getActiveVersion(connectorType: string): Promise<ConnectorVersion | null> {
    const result = await this.db.query(`
      SELECT * FROM connector_versions 
      WHERE connector_type = $1 AND status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [connectorType]);

    return result[0] || null;
  }

  async getAllVersions(connectorType: string): Promise<ConnectorVersion[]> {
    const result = await this.db.query(`
      SELECT * FROM connector_versions 
      WHERE connector_type = $1 
      ORDER BY created_at DESC
    `, [connectorType]);

    return result;
  }

  async deprecateVersion(
    connectorType: string, 
    version: string, 
    deprecationDate: Date,
    endOfLifeDate: Date,
    migrationPath?: string
  ): Promise<void> {
    await this.db.query(`
      UPDATE connector_versions 
      SET status = 'deprecated', 
          deprecation_date = $1,
          end_of_life_date = $2,
          migration_path = $3,
          updated_at = NOW()
      WHERE connector_type = $4 AND version = $5
    `, [deprecationDate, endOfLifeDate, migrationPath, connectorType, version]);

    // Schedule deprecation notifications
    await this.scheduleDeprecationNotifications(connectorType, version, deprecationDate);
  }

  async markUnsupported(connectorType: string, version: string): Promise<void> {
    await this.db.query(`
      UPDATE connector_versions 
      SET status = 'unsupported', 
          updated_at = NOW()
      WHERE connector_type = $1 AND version = $2
    `, [connectorType, version]);
  }

  async addCompatibilityMatrix(compatibility: Omit<VersionCompatibility, 'id' | 'connectorType'> & { connectorType: string }): Promise<VersionCompatibility> {
    const result = await this.db.query(`
      INSERT INTO version_compatibility (
        connector_type, from_version, to_version, compatibility,
        migration_required, migration_script, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      compatibility.connectorType,
      compatibility.fromVersion,
      compatibility.toVersion,
      compatibility.compatibility,
      compatibility.migrationRequired,
      compatibility.migrationScript,
      compatibility.notes
    ]);

    return result[0];
  }

  async getMigrationPath(fromVersion: string, toVersion: string): Promise<string | null> {
    const result = await this.db.query(`
      SELECT migration_script FROM version_compatibility 
      WHERE from_version = $1 AND to_version = $2 AND migration_required = true
      LIMIT 1
    `, [fromVersion, toVersion]);

    return result[0]?.migration_script || null;
  }

  async checkCompatibility(connectorType: string, fromVersion: string, toVersion: string): Promise<VersionCompatibility | null> {
    const result = await this.db.query(`
      SELECT * FROM version_compatibility 
      WHERE connector_type = $1 AND from_version = $2 AND to_version = $3
      LIMIT 1
    `, [connectorType, fromVersion, toVersion]);

    return result[0] || null;
  }

  async getVersionsRequiringAttention(): Promise<ConnectorVersion[]> {
    const result = await this.db.query(`
      SELECT * FROM connector_versions 
      WHERE status IN ('deprecated', 'unsupported')
        OR (deprecation_date IS NOT NULL AND deprecation_date <= NOW() + INTERVAL '30 days')
      ORDER BY deprecation_date ASC NULLS LAST
    `);

    return result;
  }

  async setDeprecationPolicy(connectorType: string, policy: DeprecationPolicy): Promise<void> {
    await this.db.query(`
      INSERT INTO deprecation_policies (
        connector_type, notice_period_days, end_of_life_period_days,
        auto_migration_enabled, notification_channels, grace_period_features
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (connector_type) 
      DO UPDATE SET 
        notice_period_days = EXCLUDED.notice_period_days,
        end_of_life_period_days = EXCLUDED.end_of_life_period_days,
        auto_migration_enabled = EXCLUDED.auto_migration_enabled,
        notification_channels = EXCLUDED.notification_channels,
        grace_period_features = EXCLUDED.grace_period_features,
        updated_at = NOW()
    `, [
      connectorType,
      policy.noticePeriodDays,
      policy.endOfLifePeriodDays,
      policy.autoMigrationEnabled,
      policy.notificationChannels,
      policy.gracePeriodFeatures
    ]);
  }

  async getDeprecationPolicy(connectorType: string): Promise<DeprecationPolicy> {
    const result = await this.db.query(`
      SELECT * FROM deprecation_policies WHERE connector_type = $1
    `, [connectorType]);

    if (result.length === 0) {
      return this.defaultPolicy;
    }

    const policy = result[0];
    return {
      noticePeriodDays: policy.notice_period_days,
      endOfLifePeriodDays: policy.end_of_life_period_days,
      autoMigrationEnabled: policy.auto_migration_enabled,
      notificationChannels: policy.notification_channels,
      gracePeriodFeatures: policy.grace_period_features
    };
  }

  private async scheduleDeprecationNotifications(
    connectorType: string, 
    version: string, 
    deprecationDate: Date
  ): Promise<void> {
    // Get all integrations using this version
    const integrations = await this.db.query(`
      SELECT i.id, i.project_id, i.name 
      FROM integrations i
      WHERE i.type = $1 AND i.config->>'version' = $2
    `, [connectorType, version]);

    // Schedule notifications for different intervals
    const notificationIntervals = [
      { days: 90, type: 'initial_notice' },
      { days: 30, type: 'final_notice' },
      { days: 7, type: 'urgent_notice' }
    ];

    for (const interval of notificationIntervals) {
      const notificationDate = new Date(deprecationDate);
      notificationDate.setDate(notificationDate.getDate() - interval.days);

      if (notificationDate > new Date()) {
        await this.db.query(`
          INSERT INTO scheduled_notifications (
            id, integration_id, notification_type, scheduled_date, 
            connector_type, version, message_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          uuidv4(),
          integrations.map(i => i.id),
          interval.type,
          notificationDate,
          connectorType,
          version,
          JSON.stringify({
            deprecationDate,
            interval: interval.days,
            autoMigrationEnabled: (await this.getDeprecationPolicy(connectorType)).autoMigrationEnabled
          })
        ]);
      }
    }
  }

  async autoMigrateIntegration(integrationId: string, targetVersion: string): Promise<boolean> {
    try {
      // Get integration details
      const integration = await this.db.query(`
        SELECT * FROM integrations WHERE id = $1
      `, [integrationId]);

      if (integration.length === 0) {
        return false;
      }

      const currentVersion = integration[0].config?.version;
      if (!currentVersion) {
        return false;
      }

      // Get migration path
      const migrationScript = await this.getMigrationPath(currentVersion, targetVersion);
      if (!migrationScript) {
        return false;
      }

      // Execute migration (this would be implemented based on your migration strategy)
      const migrationResult = await this.executeMigration(integration[0], migrationScript);
      
      if (migrationResult.success) {
        // Update integration version
        await this.db.query(`
          UPDATE integrations 
          SET config = jsonb_set(config, '{version}', $2), updated_at = NOW()
          WHERE id = $1
        `, [integrationId, targetVersion]);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Auto-migration failed:', error);
      return false;
    }
  }

  private async executeMigration(integration: any, migrationScript: string): Promise<{ success: boolean; error?: string }> {
    // This would implement the actual migration logic
    // For now, return success as placeholder
    return { success: true };
  }

  async getVersionHealthMetrics(): Promise<{
    totalVersions: number;
    activeVersions: number;
    deprecatedVersions: number;
    unsupportedVersions: number;
    versionsRequiringMigration: number;
  }> {
    const metrics = await this.db.query(`
      SELECT 
        COUNT(*) as total_versions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_versions,
        COUNT(CASE WHEN status = 'deprecated' THEN 1 END) as deprecated_versions,
        COUNT(CASE WHEN status = 'unsupported' THEN 1 END) as unsupported_versions,
        COUNT(CASE WHEN deprecation_date <= NOW() + INTERVAL '30 days' THEN 1 END) as versions_requiring_migration
      FROM connector_versions
    `);

    return metrics[0];
  }
}
