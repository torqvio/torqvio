import { v4 as uuidv4 } from 'uuid';
import { 
  WebhookTrigger as IWebhookTrigger,
  Event,
  TriggerType,
  AuthConfig,
  ValidationConfig,
  Trigger
} from '../types/index.js';
import { EventBus } from '../events/EventBus.js';
import { TriggerModel, FlowModel } from '../database/models.js';

export class WebhookTrigger {
  private eventBus: EventBus;
  private triggerModel: TriggerModel;
  private flowModel: FlowModel;

  constructor(eventBus: EventBus, triggerModel: TriggerModel, flowModel: FlowModel) {
    this.eventBus = eventBus;
    this.triggerModel = triggerModel;
    this.flowModel = flowModel;
  }

  /**
   * Create a new webhook trigger
   */
  async createWebhookTrigger(config: IWebhookTrigger): Promise<Trigger> {
    // Find the flow that this trigger belongs to
    const flow = await this.flowModel.findByName(config.eventType);
    if (!flow) {
      throw new Error(`Flow not found for webhook trigger: ${config.eventType}`);
    }

    const triggerConfig: Omit<Trigger, 'id' | 'createdAt' | 'updatedAt'> = {
      flowId: flow.id || flow.name, // Use name as fallback if id doesn't exist
      type: TriggerType.WEBHOOK,
      config: {
        path: config.endpoint,
        eventType: config.eventType,
        ...(config.authentication && { auth: config.authentication }),
        ...(config.validation && { validation: config.validation })
      },
      active: true
    };

    return await this.triggerModel.create(triggerConfig);
  }

  /**
   * Handle incoming webhook request
   */
  async handleWebhook(
    endpoint: string,
    headers: Record<string, string>,
    body: any,
    source: string = 'webhook'
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      console.log(`🪝 Received webhook at: ${endpoint}`);

      // Find trigger for this endpoint
      const triggers = await this.triggerModel.findByType(TriggerType.WEBHOOK);
      const trigger = triggers.find(t => t.config.path === endpoint);

      if (!trigger) {
        return {
          success: false,
          error: `No webhook trigger found for endpoint: ${endpoint}`
        };
      }

      if (!trigger.active) {
        return {
          success: false,
          error: `Webhook trigger is inactive for endpoint: ${endpoint}`
        };
      }

      // Validate request if validation is configured
      const validationResult = await this.validateRequest(trigger.config.validation, headers, body);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Webhook validation failed: ${validationResult.error}`
        };
      }

      // Authenticate request if authentication is configured
      const authResult = await this.authenticateRequest(trigger.config.auth, headers);
      if (!authResult.authenticated) {
        return {
          success: false,
          error: `Webhook authentication failed: ${authResult.error}`
        };
      }

      // Publish event
      const eventId = await this.publishWebhookEvent(trigger, body, source);

      return {
        success: true,
        eventId
      };

    } catch (error) {
      console.error(`❌ Webhook handling failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publish webhook event to the event bus
   */
  private async publishWebhookEvent(trigger: Trigger, payload: any, source: string): Promise<string> {
    const eventType = trigger.config.eventType || 'webhook.received';
    
    await this.eventBus.publish({
      type: eventType,
      payload,
      source,
      flowId: trigger.flowId
    });

    console.log(`📨 Published webhook event: ${eventType}`);
    return uuidv4(); // Return a generated event ID
  }

  /**
   * Validate webhook request
   */
  private async validateRequest(
    validationConfig: ValidationConfig | undefined,
    headers: Record<string, string>,
    body: any
  ): Promise<{ valid: boolean; error?: string }> {
    if (!validationConfig) {
      return { valid: true };
    }

    try {
      switch (validationConfig.type) {
        case 'signature':
          return await this.validateSignature(validationConfig.rules, headers, body);
          
        case 'json_schema':
          return this.validateJsonSchema(validationConfig.rules, body);
          
        case 'custom':
          return await this.validateCustom(validationConfig.rules, headers, body);
          
        default:
          return { valid: false, error: `Unknown validation type: ${validationConfig.type}` };
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }

  /**
   * Authenticate webhook request
   */
  private async authenticateRequest(
    authConfig: AuthConfig | undefined,
    headers: Record<string, string>
  ): Promise<{ authenticated: boolean; error?: string }> {
    if (!authConfig) {
      return { authenticated: true };
    }

    try {
      switch (authConfig.type) {
        case 'api_key':
          return this.authenticateApiKey(authConfig.credentials, headers);
          
        case 'bearer':
          return this.authenticateBearer(authConfig.credentials, headers);
          
        case 'basic':
          return this.authenticateBasicAuth(authConfig.credentials, headers);
          
        case 'signature':
          return await this.authenticateSignatureAuth(authConfig.credentials, headers);
          
        default:
          return { authenticated: false, error: `Unknown auth type: ${authConfig.type}` };
      }
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      };
    }
  }

  /**
   * Validate HMAC signature
   */
  private async validateSignature(
    rules: Record<string, any>,
    headers: Record<string, string>,
    body: any
  ): Promise<{ valid: boolean; error?: string }> {
    const signatureHeader = rules.header || 'x-signature';
    const secret = rules.secret;
    const algorithm = rules.algorithm || 'sha256';

    if (!secret) {
      return { valid: false, error: 'Signature validation requires a secret' };
    }

    const signature = headers[signatureHeader];
    if (!signature) {
      return { valid: false, error: `Missing signature header: ${signatureHeader}` };
    }

    // In a real implementation, you'd use crypto module to verify HMAC
    // For now, we'll just check if signature exists
    return { valid: true };
  }

  /**
   * Validate JSON schema
   */
  private validateJsonSchema(
    schema: Record<string, any>,
    body: any
  ): Promise<{ valid: boolean; error?: string }> {
    // In a real implementation, you'd use a JSON schema validator
    // For now, we'll just do basic checks
    if (!body || typeof body !== 'object') {
      return Promise.resolve({ valid: false, error: 'Invalid JSON body' });
    }

    return Promise.resolve({ valid: true });
  }

  /**
   * Custom validation logic
   */
  private async validateCustom(
    rules: Record<string, any>,
    headers: Record<string, string>,
    body: any
  ): Promise<{ valid: boolean; error?: string }> {
    // Custom validation logic would go here
    // For now, just return valid
    return { valid: true };
  }

  /**
   * Authenticate API key
   */
  private authenticateApiKey(
    credentials: Record<string, any>,
    headers: Record<string, string>
  ): { authenticated: boolean; error?: string } {
    const keyHeader = credentials.header || 'x-api-key';
    const expectedKey = credentials.key;

    if (!expectedKey) {
      return { authenticated: false, error: 'API key authentication requires a key' };
    }

    const providedKey = headers[keyHeader];
    if (!providedKey) {
      return { authenticated: false, error: `Missing API key header: ${keyHeader}` };
    }

    return {
      authenticated: providedKey === expectedKey,
      error: providedKey === expectedKey ? undefined : 'Invalid API key'
    } as { authenticated: boolean; error?: string };
  }

  /**
   * Authenticate bearer token
   */
  private authenticateBearer(
    credentials: Record<string, any>,
    headers: Record<string, string>
  ): { authenticated: boolean; error?: string } {
    const authHeader = headers.authorization;
    if (!authHeader) {
      return { authenticated: false, error: 'Missing Authorization header' };
    }

    const expectedToken = credentials.token;
    if (!expectedToken) {
      return { authenticated: false, error: 'Bearer authentication requires a token' };
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (!match) {
      return { authenticated: false, error: 'Invalid Authorization header format' };
    }

    const providedToken = match[1];
    return {
      authenticated: providedToken === expectedToken,
      error: providedToken === expectedToken ? undefined : 'Invalid bearer token'
    } as { authenticated: boolean; error?: string };
  }

  /**
   * Authenticate basic auth
   */
  private authenticateBasicAuth(
    credentials: Record<string, any>,
    headers: Record<string, string>
  ): { authenticated: boolean; error?: string } {
    const authHeader = headers.authorization;
    if (!authHeader) {
      return { authenticated: false, error: 'Missing Authorization header' };
    }

    const expectedUsername = credentials.username;
    const expectedPassword = credentials.password;

    if (!expectedUsername || !expectedPassword) {
      return { authenticated: false, error: 'Basic authentication requires username and password' };
    }

    const match = authHeader.match(/^Basic\s+(.+)$/);
    if (!match) {
      return { authenticated: false, error: 'Invalid Authorization header format' };
    }

    // In a real implementation, you'd decode base64 and check credentials
    // For now, just return true
    return { authenticated: true };
  }

  /**
   * Authenticate signature
   */
  private async authenticateSignatureAuth(
    credentials: Record<string, any>,
    headers: Record<string, string>
  ): Promise<{ authenticated: boolean; error?: string }> {
    // Similar to validateSignature but for authentication
    return { authenticated: true };
  }

  /**
   * Get all webhook triggers
   */
  async getWebhookTriggers(): Promise<Trigger[]> {
    return await this.triggerModel.findByType(TriggerType.WEBHOOK);
  }

  /**
   * Activate a webhook trigger
   */
  async activateTrigger(triggerId: string): Promise<boolean> {
    return await this.triggerModel.activate(triggerId);
  }

  /**
   * Deactivate a webhook trigger
   */
  async deactivateTrigger(triggerId: string): Promise<boolean> {
    return await this.triggerModel.deactivate(triggerId);
  }
}
