import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: TransformationRule;
  required?: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface TransformationRule {
  type: 'direct' | 'function' | 'lookup' | 'conditional' | 'format' | 'aggregate';
  config: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom' | 'length';
  config: Record<string, any>;
  errorMessage?: string;
}

export interface TransformationTemplate {
  id: string;
  name: string;
  description: string;
  sourceType: string;
  targetType: string;
  mappings: FieldMapping[];
  enrichmentRules?: EnrichmentRule[];
  conditionalLogic?: ConditionalLogic[];
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrichmentRule {
  name: string;
  type: 'api_lookup' | 'static_value' | 'calculated' | 'external_data';
  config: Record<string, any>;
  targetField: string;
  condition?: string;
}

export interface ConditionalLogic {
  name: string;
  condition: string;
  actions: ConditionalAction[];
  priority: number;
}

export interface ConditionalAction {
  type: 'map' | 'skip' | 'transform' | 'enrich' | 'validate';
  config: Record<string, any>;
}

export interface TransformationResult {
  success: boolean;
  data: any;
  errors: TransformationError[];
  warnings: TransformationWarning[];
  metadata: {
    processingTime: number;
    fieldsProcessed: number;
    fieldsSkipped: number;
    transformationsApplied: number;
  };
}

export interface TransformationError {
  field: string;
  message: string;
  type: 'validation' | 'transformation' | 'mapping' | 'enrichment';
  severity: 'error' | 'warning';
}

export interface TransformationWarning {
  field: string;
  message: string;
  type: 'data_loss' | 'format_change' | 'default_used';
}

export class DataTransformer {
  private db: DatabaseConnection;
  private customFunctions: Map<string, Function> = new Map();

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
    this.registerBuiltInFunctions();
  }

  private async initializeTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS transformation_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        source_type VARCHAR(100) NOT NULL,
        target_type VARCHAR(100) NOT NULL,
        mappings JSONB NOT NULL,
        enrichment_rules JSONB,
        conditional_logic JSONB,
        version VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS transformation_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES transformation_templates(id),
        source_data JSONB NOT NULL,
        target_data JSONB NOT NULL,
        errors JSONB,
        warnings JSONB,
        metadata JSONB,
        processing_time INTEGER,
        success BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS custom_functions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) UNIQUE NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  private registerBuiltInFunctions(): void {
    // String transformations
    this.customFunctions.set('uppercase', (value: string) => value?.toUpperCase());
    this.customFunctions.set('lowercase', (value: string) => value?.toLowerCase());
    this.customFunctions.set('trim', (value: string) => value?.trim());
    this.customFunctions.set('substring', (value: string, start: number, length?: number) => 
      value?.substring(start, length));
    this.customFunctions.set('replace', (value: string, search: string, replace: string) => 
      value?.replace(search, replace));

    // Number transformations
    this.customFunctions.set('round', (value: number, decimals: number = 0) => 
      Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals));
    this.customFunctions.set('abs', (value: number) => Math.abs(value));
    this.customFunctions.set('percentage', (value: number, total: number) => 
      total > 0 ? (value / total) * 100 : 0);

    // Date transformations
    this.customFunctions.set('formatDate', (value: string | Date, format: string) => {
      const date = new Date(value);
      // Basic date formatting - can be enhanced with moment.js or similar
      return date.toISOString();
    });
    this.customFunctions.set('addDays', (value: string | Date, days: number) => {
      const date = new Date(value);
      date.setDate(date.getDate() + days);
      return date;
    });

    // Array/Object transformations
    this.customFunctions.set('extractProperty', (obj: any, property: string) => obj?.[property]);
    this.customFunctions.set('arrayLength', (arr: any[]) => arr?.length || 0);
    this.customFunctions.set('firstElement', (arr: any[]) => arr?.[0]);
    this.customFunctions.set('join', (arr: string[], separator: string = ',') => arr?.join(separator));

    // Conditional transformations
    this.customFunctions.set('coalesce', (...values: any[]) => 
      values.find(v => v !== null && v !== undefined));
    this.customFunctions.set('default', (value: any, defaultValue: any) => 
      value !== null && value !== undefined ? value : defaultValue);
  }

  async createTemplate(template: Omit<TransformationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransformationTemplate> {
    const result = await this.db.query(`
      INSERT INTO transformation_templates (
        name, description, source_type, target_type, mappings,
        enrichment_rules, conditional_logic, version, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      template.name,
      template.description,
      template.sourceType,
      template.targetType,
      JSON.stringify(template.mappings),
      JSON.stringify(template.enrichmentRules || []),
      JSON.stringify(template.conditionalLogic || []),
      template.version,
      template.isActive
    ]);

    return result[0];
  }

  async getTemplate(templateId: string): Promise<TransformationTemplate | null> {
    const result = await this.db.query(`
      SELECT * FROM transformation_templates WHERE id = $1 AND is_active = true
    `, [templateId]);

    if (result.length === 0) return null;

    const template = result[0];
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      sourceType: template.source_type,
      targetType: template.target_type,
      mappings: template.mappings,
      enrichmentRules: template.enrichment_rules,
      conditionalLogic: template.conditional_logic,
      version: template.version,
      isActive: template.is_active,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    };
  }

  async getTemplatesByType(sourceType: string, targetType: string): Promise<TransformationTemplate[]> {
    const result = await this.db.query(`
      SELECT * FROM transformation_templates 
      WHERE source_type = $1 AND target_type = $2 AND is_active = true
      ORDER BY updated_at DESC
    `, [sourceType, targetType]);

    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      sourceType: row.source_type,
      targetType: row.target_type,
      mappings: row.mappings,
      enrichmentRules: row.enrichment_rules,
      conditionalLogic: row.conditional_logic,
      version: row.version,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async transform(
    sourceData: any,
    templateId: string,
    options: {
      strictMode?: boolean;
      includeMetadata?: boolean;
      logHistory?: boolean;
    } = {}
  ): Promise<TransformationResult> {
    const startTime = Date.now();
    const template = await this.getTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const result: TransformationResult = {
      success: true,
      data: {},
      errors: [],
      warnings: [],
      metadata: {
        processingTime: 0,
        fieldsProcessed: 0,
        fieldsSkipped: 0,
        transformationsApplied: 0
      }
    };

    try {
      // Apply conditional logic first
      const processedData = await this.applyConditionalLogic(sourceData, template.conditionalLogic || []);

      // Apply field mappings
      for (const mapping of template.mappings) {
        const mappingResult = await this.applyFieldMapping(processedData, mapping, options.strictMode);
        
        if (mappingResult.success) {
          result.data[mapping.targetField] = mappingResult.value;
          result.metadata.fieldsProcessed++;
        } else {
          result.errors.push(...mappingResult.errors);
          result.metadata.fieldsSkipped++;
        }

        if (mappingResult.warnings) {
          result.warnings.push(...mappingResult.warnings);
        }

        if (mappingResult.transformed) {
          if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(mappingResult.value)) {
            result.metadata.transformationsApplied++;
          }
        }
      }

      // Apply enrichment rules
      if (template.enrichmentRules) {
        const enrichmentResult = await this.applyEnrichmentRules(result.data, template.enrichmentRules);
        result.data = enrichmentResult.data;
        result.errors.push(...enrichmentResult.errors);
        result.warnings.push(...enrichmentResult.warnings);
      }

      // Determine overall success
      result.success = options.strictMode ? result.errors.length === 0 : result.errors.filter(e => e.severity === 'error').length === 0;

      // Log transformation history
      if (options.logHistory !== false) {
        await this.logTransformation(templateId, sourceData, result.data, result, Date.now() - startTime);
      }

    } catch (error) {
      result.success = false;
      result.errors.push({
        field: 'global',
        message: error instanceof Error ? error.message : 'Unknown transformation error',
        type: 'transformation',
        severity: 'error'
      });
    }

    result.metadata.processingTime = Date.now() - startTime;

    return result;
  }

  private async applyFieldMapping(
    sourceData: any,
    mapping: FieldMapping,
    strictMode: boolean = false
  ): Promise<{
    success: boolean;
    value: any;
    errors: TransformationError[];
    warnings?: TransformationWarning[];
    transformed?: boolean;
  }> {
    const result = {
      success: true,
      value: null,
      errors: [] as TransformationError[],
      warnings: [] as TransformationWarning[],
      transformed: false
    };

    try {
      // Extract source value
      let sourceValue = this.extractNestedValue(sourceData, mapping.sourceField);

      // Check if required field is missing
      if (mapping.required && (sourceValue === null || sourceValue === undefined)) {
        if (mapping.defaultValue !== undefined) {
          sourceValue = mapping.defaultValue;
          result.warnings?.push({
            field: mapping.targetField,
            message: `Required field ${mapping.sourceField} was missing, using default value`,
            type: 'default_used'
          });
        } else {
          result.success = false;
          result.errors.push({
            field: mapping.targetField,
            message: `Required field ${mapping.sourceField} is missing`,
            type: 'mapping',
            severity: 'error'
          });
          return result;
        }
      }

      // Skip if value is null/undefined and not required
      if (sourceValue === null || sourceValue === undefined) {
        result.success = false;
        return result;
      }

      // Apply validations
      if (mapping.validation) {
        const validationResult = await this.applyValidation(sourceValue, mapping.validation);
        if (!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
          if (strictMode) {
            return result;
          }
        }
      }

      // Apply transformation
      if (mapping.transformation) {
        const transformedValue = await this.applyTransformation(sourceValue, mapping.transformation);
        if (transformedValue.success) {
          sourceValue = transformedValue.value;
          result.transformed = true;
        } else {
          result.success = false;
          result.errors.push(...transformedValue.errors);
          if (strictMode) {
            return result;
          }
        }
      }

      result.value = sourceValue;

    } catch (error) {
      result.success = false;
      result.errors.push({
        field: mapping.targetField,
        message: error instanceof Error ? error.message : 'Unknown mapping error',
        type: 'mapping',
        severity: 'error'
      });
    }

    return result;
  }

  private extractNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private async applyValidation(value: any, rules: ValidationRule[]): Promise<{
    valid: boolean;
    errors: TransformationError[];
  }> {
    const result = {
      valid: true,
      errors: [] as TransformationError[]
    };

    for (const rule of rules) {
      try {
        let isValid = true;

        switch (rule.type) {
          case 'required':
            isValid = value !== null && value !== undefined && value !== '';
            break;
          case 'type':
            isValid = typeof value === rule.config.expectedType;
            break;
          case 'range':
            if (typeof value === 'number') {
              isValid = value >= (rule.config.min || Number.MIN_SAFE_INTEGER) && 
                       value <= (rule.config.max || Number.MAX_SAFE_INTEGER);
            }
            break;
          case 'pattern':
            if (typeof value === 'string') {
              const regex = new RegExp(rule.config.pattern);
              isValid = regex.test(value);
            }
            break;
          case 'length':
            if (typeof value === 'string' || Array.isArray(value)) {
              const length = value.length;
              isValid = length >= (rule.config.min || 0) && length <= (rule.config.max || Number.MAX_SAFE_INTEGER);
            }
            break;
          case 'custom':
            // Custom validation function would be implemented here
            isValid = true; // Placeholder
            break;
        }

        if (!isValid) {
          result.valid = false;
          result.errors.push({
            field: 'validation',
            message: rule.errorMessage || `Validation failed for ${rule.type} rule`,
            type: 'validation',
            severity: 'error'
          });
        }
      } catch (error) {
        result.valid = false;
        result.errors.push({
          field: 'validation',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
          type: 'validation',
          severity: 'error'
        });
      }
    }

    return result;
  }

  private async applyTransformation(value: any, rule: TransformationRule): Promise<{
    success: boolean;
    value: any;
    errors: TransformationError[];
  }> {
    const result = {
      success: true,
      value: value,
      errors: [] as TransformationError[]
    };

    try {
      switch (rule.type) {
        case 'direct':
          // Direct mapping, no transformation
          break;

        case 'function':
          {
            const func = this.customFunctions.get(rule.config.functionName);
            if (func) {
              result.value = func(value, ...(rule.config.args || []));
            } else {
              result.success = false;
              result.errors.push({
                field: 'transformation',
                message: `Function ${rule.config.functionName} not found`,
                type: 'transformation',
                severity: 'error'
              });
            }
          }
          break;

        case 'lookup':
          // Lookup transformation - would fetch from external source
          result.value = await this.performLookup(rule.config.lookupTable, value);
          break;

        case 'conditional':
          // Conditional transformation
          result.value = await this.applyConditionalTransformation(value, rule.config.conditions);
          break;

        case 'format':
          // Format transformation
          result.value = this.applyFormatting(value, rule.config.format);
          break;

        case 'aggregate':
          // Aggregate transformation
          result.value = await this.applyAggregation(value, rule.config.aggregationType);
          break;

        default:
          result.success = false;
          result.errors.push({
            field: 'transformation',
            message: `Unknown transformation type: ${rule.type}`,
            type: 'transformation',
            severity: 'error'
          });
      }
    } catch (error) {
      result.success = false;
      result.errors.push({
        field: 'transformation',
        message: error instanceof Error ? error.message : 'Unknown transformation error',
        type: 'transformation',
        severity: 'error'
      });
    }

    return result;
  }

  private async performLookup(lookupTable: string, key: any): Promise<any> {
    // This would implement lookup logic - could be database table, external API, etc.
    // For now, return the key as placeholder
    return key;
  }

  private async applyConditionalTransformation(value: any, conditions: any[]): Promise<any> {
    for (const condition of conditions) {
      if (this.evaluateCondition(value, condition.condition)) {
        return condition.value;
      }
    }
    return value;
  }

  private evaluateCondition(value: any, condition: string): boolean {
    // Simple condition evaluation - could be enhanced with proper expression parser
    try {
      // Very basic evaluation - in production, use a proper expression parser
      return eval(condition.replace('value', JSON.stringify(value)));
    } catch {
      return false;
    }
  }

  private applyFormatting(value: any, format: string): any {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      default:
        return value;
    }
  }

  private async applyAggregation(value: any, aggregationType: string): Promise<any> {
    if (!Array.isArray(value)) {
      return value;
    }

    switch (aggregationType) {
      case 'sum':
        return value.reduce((sum, item) => sum + (Number(item) || 0), 0);
      case 'avg':
        return value.length > 0 ? value.reduce((sum, item) => sum + (Number(item) || 0), 0) / value.length : 0;
      case 'count':
        return value.length;
      case 'min':
        return Math.min(...value.map(Number));
      case 'max':
        return Math.max(...value.map(Number));
      case 'join':
        return value.join(', ');
      default:
        return value;
    }
  }

  private async applyConditionalLogic(data: any, conditionalLogic: ConditionalLogic[]): Promise<any> {
    let result = { ...data };

    // Sort by priority
    const sortedLogic = conditionalLogic.sort((a, b) => b.priority - a.priority);

    for (const logic of sortedLogic) {
      if (this.evaluateCondition(result, logic.condition)) {
        for (const action of logic.actions) {
          result = await this.applyConditionalAction(result, action);
        }
      }
    }

    return result;
  }

  private async applyConditionalAction(data: any, action: ConditionalAction): Promise<any> {
    switch (action.type) {
      case 'map':
        return { ...data, ...action.config.mapping };
      case 'skip':
        // Skip logic would be handled at a higher level
        return data;
      case 'transform':
        // Apply transformation to specified field
        {
          const field = action.config.field;
          const transformation = action.config.transformation;
          const transformResult = await this.applyTransformation(data[field], transformation);
          return { ...data, [field]: transformResult.value };
        }
      case 'enrich':
        // Apply enrichment
        {
          const enrichmentResult = await this.applyEnrichmentRules(data, [action.config.enrichment]);
          return enrichmentResult.data;
        }
      case 'validate':
        // Apply validation
        {
          const validationResult = await this.applyValidation(data[action.config.field], action.config.rules);
          if (!validationResult.valid) {
            // Handle validation failure
          }
        }
        return data;
      default:
        return data;
    }
  }

  private async applyEnrichmentRules(data: any, rules: EnrichmentRule[]): Promise<{
    data: any;
    errors: TransformationError[];
    warnings: TransformationWarning[];
  }> {
    const result = {
      data: { ...data },
      errors: [] as TransformationError[],
      warnings: [] as TransformationWarning[]
    };

    for (const rule of rules) {
      try {
        // Check condition if present
        if (rule.condition && !this.evaluateCondition(result.data, rule.condition)) {
          continue;
        }

        let enrichedValue: any;

        switch (rule.type) {
          case 'static_value':
            enrichedValue = rule.config.value;
            break;
          case 'calculated':
            enrichedValue = this.calculateValue(result.data, rule.config.expression);
            break;
          case 'api_lookup':
            enrichedValue = await this.performApiLookup(rule.config.apiUrl, result.data);
            break;
          case 'external_data':
            enrichedValue = await this.fetchExternalData(rule.config.source, result.data);
            break;
          default:
            continue;
        }

        result.data[rule.targetField] = enrichedValue;
      } catch (error) {
        result.errors.push({
          field: rule.targetField,
          message: error instanceof Error ? error.message : 'Enrichment failed',
          type: 'enrichment',
          severity: 'warning'
        });
      }
    }

    return result;
  }

  private calculateValue(data: any, expression: string): any {
    // Simple expression evaluation - in production, use a proper expression parser
    try {
      return eval(expression.replace(/data\./g, 'data.'));
    } catch {
      return null;
    }
  }

  private async performApiLookup(apiUrl: string, data: any): Promise<any> {
    // This would implement API lookup logic
    // For now, return null as placeholder
    return null;
  }

  private async fetchExternalData(source: string, data: any): Promise<any> {
    // This would implement external data fetching
    // For now, return null as placeholder
    return null;
  }

  private async logTransformation(
    templateId: string,
    sourceData: any,
    targetData: any,
    result: TransformationResult,
    processingTime: number
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO transformation_history (
        template_id, source_data, target_data, errors, warnings, metadata, processing_time, success
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      templateId,
      JSON.stringify(sourceData),
      JSON.stringify(targetData),
      JSON.stringify(result.errors),
      JSON.stringify(result.warnings),
      JSON.stringify(result.metadata),
      processingTime,
      result.success
    ]);
  }

  async getTransformationHistory(
    templateId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const result = await this.db.query(`
      SELECT * FROM transformation_history 
      WHERE template_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [templateId, limit, offset]);

    return result;
  }

  async registerCustomFunction(name: string, code: string, description?: string): Promise<void> {
    // In a real implementation, this would validate and store the custom function
    // For now, just register it in memory
    try {
      const func = new Function('return ' + code)();
      this.customFunctions.set(name, func);

      await this.db.query(`
        INSERT INTO custom_functions (name, code, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          code = EXCLUDED.code,
          description = EXCLUDED.description,
          updated_at = NOW()
      `, [name, code, description]);
    } catch (error) {
      throw new Error(`Failed to register custom function ${name}: ${error}`);
    }
  }

  async getCustomFunctions(): Promise<Array<{ name: string; description: string; isActive: boolean }>> {
    const result = await this.db.query(`
      SELECT name, description, is_active FROM custom_functions WHERE is_active = true
    `);

    return result;
  }
}
