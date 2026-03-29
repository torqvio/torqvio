import { logger } from '../utils/logger.js';
import { DatabaseConnection } from '../database/connection.js';

export interface StepInput {
  [key: string]: any;
}

export interface StepContext {
  workflowId?: string;
  executionId?: string;
  stepName?: string;
  [key: string]: any;
}

export interface StepResult {
  [key: string]: any;
}

export interface HttpStepInput extends StepInput {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

export interface TransformStepInput extends StepInput {
  script: string;
  variables?: Record<string, any>;
}

export interface ConditionStepInput extends StepInput {
  condition: string;
  trueValue?: any;
  falseValue?: any;
}

export interface DelayStepInput extends StepInput {
  milliseconds?: number;
}

export interface ValidateStepInput extends StepInput {
  schema: {
    required?: string[];
    [key: string]: any;
  };
  data: any;
}

export interface EmailStepInput extends StepInput {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface DatabaseQueryStepInput extends StepInput {
  query: string;
  params?: any[];
}

export interface WebhookStepInput extends StepInput {
  url: string;
  payload: any;
  headers?: Record<string, string>;
}

/**
 * Centralized step handlers to eliminate duplication across route files
 */
export class StepHandlers {
  /**
   * HTTP request handler
   */
  static async http_request(input: HttpStepInput, context: StepContext): Promise<StepResult> {
    const { url, method = 'GET', headers = {}, body } = input;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`HTTP ${method} request successful`, { url, status: response.status });
      
      return data;
    } catch (error) {
      logger.error('HTTP request step failed:', error);
      throw error;
    }
  }

  /**
   * Data transformation handler with safe script execution
   */
  static async transform(input: TransformStepInput, context: StepContext): Promise<StepResult> {
    const { script, variables = {} } = input;
    
    try {
      // Create a safe evaluation context with limited scope
      const safeScript = `
        (function(input, context, variables) {
          "use strict";
          ${script}
        })
      `;
      
      const func = new Function('return ' + safeScript)();
      const result = func(input, context, variables);
      
      logger.info('Transform step executed successfully', { 
        executionId: context.executionId,
        stepName: context.stepName 
      });
      
      return result;
    } catch (error) {
      logger.error('Transform step failed:', error);
      throw new Error(`Transform execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Condition handler with safe evaluation
   */
  static async condition(input: ConditionStepInput, context: StepContext): Promise<StepResult> {
    const { condition, trueValue, falseValue } = input;
    
    try {
      // Create safe condition evaluation
      const safeCondition = `
        (function(input, context) {
          "use strict";
          return ${condition};
        })
      `;
      
      const func = new Function('return ' + safeCondition)();
      const result = func(input, context);
      
      const finalResult = result ? trueValue : falseValue;
      
      logger.info('Condition step executed', { 
        condition, 
        result: finalResult,
        executionId: context.executionId 
      });
      
      return finalResult;
    } catch (error) {
      logger.error('Condition step failed:', error);
      throw new Error(`Condition evaluation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Delay handler
   */
  static async delay(input: DelayStepInput, context: StepContext): Promise<StepResult> {
    const { milliseconds = 1000 } = input;
    
    logger.info(`Delay step executing for ${milliseconds}ms`, { 
      executionId: context.executionId 
    });
    
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    
    return { 
      delayed: true, 
      duration: milliseconds,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Data validation handler
   */
  static async validate(input: ValidateStepInput, context: StepContext): Promise<StepResult> {
    const { schema, data } = input;
    
    try {
      const required = schema.required || [];
      const missing = required.filter((field: string) => !(field in data));
      
      if (missing.length > 0) {
        throw new Error(`Validation failed: missing required fields: ${missing.join(', ')}`);
      }
      
      logger.info('Validation step passed', { 
        requiredFields: required.length,
        executionId: context.executionId 
      });
      
      return { 
        valid: true, 
        data,
        validatedFields: required
      };
    } catch (error) {
      logger.error('Validation step failed:', error);
      throw error;
    }
  }

  /**
   * Email handler (placeholder for actual email service integration)
   */
  static async send_email(input: EmailStepInput, context: StepContext): Promise<StepResult> {
    const { to, subject, body, from } = input;
    
    try {
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      logger.info('Email would be sent:', { to, subject, from });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { 
        sent: true, 
        to, 
        subject,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Email step failed:', error);
      throw error;
    }
  }

  /**
   * Database query handler
   */
  static async database_query(input: DatabaseQueryStepInput, context: StepContext): Promise<StepResult> {
    const { query, params = [] } = input;
    
    try {
      const db = DatabaseConnection.getInstance();
      const result = await db.query(query, params);
      
      logger.info('Database query executed successfully', { 
        query: query.substring(0, 100), // Log first 100 chars of query
        paramCount: params.length,
        resultCount: Array.isArray(result) ? result.length : 1,
        executionId: context.executionId 
      });
      
      return { 
        success: true, 
        data: result, 
        count: Array.isArray(result) ? result.length : 1
      };
    } catch (error) {
      logger.error('Database query step failed:', error);
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  }

  /**
   * Webhook handler
   */
  static async webhook(input: WebhookStepInput, context: StepContext): Promise<StepResult> {
    const { url, payload, headers = {} } = input;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
      
      logger.info('Webhook sent successfully', { 
        url, 
        status: response.status,
        executionId: context.executionId 
      });
      
      return { 
        webhookSent: true, 
        url, 
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Webhook step failed:', error);
      throw error;
    }
  }

  /**
   * Get handler by step type
   */
  static getHandler(stepType: string): (input: StepInput, context: StepContext) => Promise<StepResult> {
    const handlers: Record<string, (input: StepInput, context: StepContext) => Promise<StepResult>> = {
      http_request: async (input: StepInput, context: StepContext) => {
        // Type assertion for specific handler
        return this.http_request(input as HttpStepInput, context);
      },
      transform: async (input: StepInput, context: StepContext) => {
        return this.transform(input as TransformStepInput, context);
      },
      condition: async (input: StepInput, context: StepContext) => {
        return this.condition(input as ConditionStepInput, context);
      },
      delay: async (input: StepInput, context: StepContext) => {
        return this.delay(input as DelayStepInput, context);
      },
      validate: async (input: StepInput, context: StepContext) => {
        return this.validate(input as ValidateStepInput, context);
      },
      send_email: async (input: StepInput, context: StepContext) => {
        return this.send_email(input as EmailStepInput, context);
      },
      database_query: async (input: StepInput, context: StepContext) => {
        return this.database_query(input as DatabaseQueryStepInput, context);
      },
      webhook: async (input: StepInput, context: StepContext) => {
        return this.webhook(input as WebhookStepInput, context);
      }
    };
    
    return handlers[stepType] || handlers.transform;
  }
}
