import { 
  ConnectorFramework, 
  ConnectorRegistry,
  AuthenticationConfig,
  EndpointDefinition,
  TestResult
} from '@torqvio/client';
import { Logger } from '../utils/logger';
import { HttpClient } from '../utils/http-client';

export class ConnectorService {
  private logger: Logger;
  private http: HttpClient;
  private registry: ConnectorRegistry;

  constructor() {
    this.logger = new Logger('ConnectorService');
    this.http = new HttpClient();
    this.registry = new ConnectorRegistryImpl();
    this.initializePrebuiltConnectors();
  }

  // Registry Management
  async getConnectors(options: {
    category?: string;
    search?: string;
  }): Promise<ConnectorFramework[]> {
    try {
      let connectors = Array.from(this.registry.connectors.values());

      if (options.category) {
        connectors = connectors.filter(c => c.definition.category === options.category);
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        connectors = connectors.filter(c => 
          c.definition.name.toLowerCase().includes(searchLower) ||
          c.definition.description.toLowerCase().includes(searchLower) ||
          c.definition.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return connectors;
    } catch (error) {
      this.logger.error('Failed to get connectors', { options, error });
      throw error;
    }
  }

  async getConnectorById(id: string): Promise<ConnectorFramework | null> {
    try {
      return this.registry.connectors.get(id) || null;
    } catch (error) {
      this.logger.error('Failed to get connector by ID', { id, error });
      throw error;
    }
  }

  async createConnector(connector: ConnectorFramework): Promise<ConnectorFramework> {
    try {
      // Validate connector configuration
      this.validateConnector(connector);

      // Register the connector
      this.registry.register(connector);

      this.logger.info('Connector created', { id: connector.definition.name });
      return connector;
    } catch (error) {
      this.logger.error('Failed to create connector', { connector, error });
      throw error;
    }
  }

  // Pre-built Connector Implementations
  private initializePrebuiltConnectors(): void {
    // Salesforce Connector
    const salesforceConnector: ConnectorFramework = {
      definition: {
        name: 'Salesforce',
        version: '1.0.0',
        description: 'Connect to Salesforce CRM for lead management, customer data, and sales automation.',
        category: 'crm',
        tags: ['crm', 'sales', 'leads', 'contacts'],
        icon: '🏢'
      },
      authentication: {
        type: 'oauth2',
        configuration: {
          oauth2: {
            authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
            tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
            scopes: ['api', 'refresh_token'],
            grantType: 'authorization_code'
          }
        }
      },
      endpoints: {
        leads: {
          name: 'Leads',
          method: 'GET',
          path: '/services/data/v52.0/query',
          parameters: [
            {
              name: 'q',
              type: 'string',
              required: true,
              location: 'query',
              description: 'SOQL query string'
            }
          ],
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                totalSize: { type: 'number' },
                done: { type: 'boolean' },
                records: { type: 'array' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 400,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid query'
            },
            {
              statusCode: 401,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Unauthorized'
            }
          ],
          rateLimit: {
            requestsPer24Hours: 15000,
            concurrentRequests: 25
          }
        },
        createLead: {
          name: 'Create Lead',
          method: 'POST',
          path: '/services/data/v52.0/sobjects/Lead',
          parameters: [],
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                FirstName: { type: 'string' },
                LastName: { type: 'string' },
                Email: { type: 'string' },
                Company: { type: 'string' },
                LeadSource: { type: 'string' }
              },
              required: ['LastName', 'Company']
            },
            required: true
          },
          response: {
            statusCode: 201,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                success: { type: 'boolean' },
                errors: { type: 'array' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 400,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid data'
            }
          ],
          rateLimit: {
            requestsPer24Hours: 15000,
            concurrentRequests: 25
          }
        }
      },
      rateLimiting: {
        default: {
          requestsPer24Hours: 15000,
          concurrentRequests: 25
        },
        strategy: 'fixed',
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['500', '502', '503', '504']
        }
      },
      errorHandling: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['500', '502', '503', '504']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          monitoringWindow: 300000
        },
        timeout: 30000,
        validation: {
          requestValidation: true,
          responseValidation: false,
          customValidators: []
        }
      },
      testing: {
        connectionTest: {
          endpoint: '/services/data/v52.0/sobjects/User',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000
        },
        endpointTests: [
          {
            name: 'Query Leads',
            endpoint: '/services/data/v52.0/query',
            method: 'GET',
            parameters: { q: 'SELECT Id, Name FROM Lead LIMIT 1' },
            expectedResponse: { totalSize: 0 },
            expectedStatus: 200
          }
        ],
        scenarios: []
      }
    };

    // HubSpot Connector
    const hubspotConnector: ConnectorFramework = {
      definition: {
        name: 'HubSpot',
        version: '1.0.0',
        description: 'Connect to HubSpot for marketing automation, lead nurturing, and customer relationship management.',
        category: 'crm',
        tags: ['crm', 'marketing', 'leads', 'automation'],
        icon: '🎯'
      },
      authentication: {
        type: 'api-key',
        configuration: {
          apiKey: {
            header: 'Authorization'
          }
        }
      },
      endpoints: {
        contacts: {
          name: 'Contacts',
          method: 'GET',
          path: '/crm/v3/objects/contacts',
          parameters: [
            {
              name: 'limit',
              type: 'number',
              required: false,
              location: 'query',
              description: 'Number of contacts to return'
            },
            {
              name: 'after',
              type: 'string',
              required: false,
              location: 'query',
              description: 'Paging cursor'
            }
          ],
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                results: { type: 'array' },
                paging: { type: 'object' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 401,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid API key'
            }
          ],
          rateLimit: {
            requestsPer10Seconds: 100,
            requestsPerDay: 250000
          }
        },
        createContact: {
          name: 'Create Contact',
          method: 'POST',
          path: '/crm/v3/objects/contacts',
          parameters: [],
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    firstname: { type: 'string' },
                    lastname: { type: 'string' },
                    company: { type: 'string' }
                  }
                }
              },
              required: ['properties']
            },
            required: true
          },
          response: {
            statusCode: 201,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                properties: { type: 'object' },
                createdAt: { type: 'string' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 400,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid contact data'
            }
          ],
          rateLimit: {
            requestsPer10Seconds: 100,
            requestsPerDay: 250000
          }
        }
      },
      rateLimiting: {
        default: {
          requestsPer10Seconds: 100,
          requestsPerDay: 250000
        },
        strategy: 'sliding',
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        }
      },
      errorHandling: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          monitoringWindow: 300000
        },
        timeout: 30000,
        validation: {
          requestValidation: true,
          responseValidation: false,
          customValidators: []
        }
      },
      testing: {
        connectionTest: {
          endpoint: '/crm/v3/objects/contacts',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000
        },
        endpointTests: [
          {
            name: 'List Contacts',
            endpoint: '/crm/v3/objects/contacts',
            method: 'GET',
            parameters: { limit: 1 },
            expectedResponse: { results: [] },
            expectedStatus: 200
          }
        ],
        scenarios: []
      }
    };

    // Slack Connector
    const slackConnector: ConnectorFramework = {
      definition: {
        name: 'Slack',
        version: '1.0.0',
        description: 'Connect to Slack for team notifications, alerts, and automated messaging.',
        category: 'communication',
        tags: ['communication', 'messaging', 'notifications', 'team'],
        icon: '💬'
      },
      authentication: {
        type: 'bearer',
        configuration: {
          bearer: {
            tokenField: 'token'
          }
        }
      },
      endpoints: {
        chat: {
          name: 'Post Message',
          method: 'POST',
          path: '/chat.postMessage',
          parameters: [],
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                channel: { type: 'string' },
                text: { type: 'string' },
                blocks: { type: 'array' }
              },
              required: ['channel', 'text']
            },
            required: true
          },
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                channel: { type: 'string' },
                ts: { type: 'string' },
                message: { type: 'object' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 401,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid token'
            }
          ],
          rateLimit: {
            messagesPerMinute: 60
          }
        },
        channels: {
          name: 'Get Channel Info',
          method: 'GET',
          path: '/channels.info',
          parameters: [
            {
              name: 'channel',
              type: 'string',
              required: true,
              location: 'query',
              description: 'Channel ID'
            }
          ],
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                channel: { type: 'object' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 404,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Channel not found'
            }
          ],
          rateLimit: {
            requestsPerMinute: 50
          }
        }
      },
      rateLimiting: {
        default: {
          requestsPerMinute: 50,
          messagesPerMinute: 60
        },
        strategy: 'sliding',
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        }
      },
      errorHandling: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          monitoringWindow: 300000
        },
        timeout: 30000,
        validation: {
          requestValidation: true,
          responseValidation: false,
          customValidators: []
        }
      },
      testing: {
        connectionTest: {
          endpoint: '/auth.test',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000
        },
        endpointTests: [
          {
            name: 'Test Authentication',
            endpoint: '/auth.test',
            method: 'GET',
            expectedResponse: { ok: true },
            expectedStatus: 200
          }
        ],
        scenarios: []
      }
    };

    // Shopify Connector
    const shopifyConnector: ConnectorFramework = {
      definition: {
        name: 'Shopify',
        version: '1.0.0',
        description: 'Connect to Shopify for e-commerce automation, order processing, and inventory management.',
        category: 'ecommerce',
        tags: ['ecommerce', 'orders', 'inventory', 'products'],
        icon: '🛒'
      },
      authentication: {
        type: 'oauth2',
        configuration: {
          oauth2: {
            authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
            tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
            scopes: ['read_products', 'read_orders', 'write_orders'],
            grantType: 'authorization_code'
          }
        }
      },
      endpoints: {
        orders: {
          name: 'Get Orders',
          method: 'GET',
          path: '/admin/api/2023-01/orders.json',
          parameters: [
            {
              name: 'status',
              type: 'string',
              required: false,
              location: 'query',
              description: 'Order status filter'
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              location: 'query',
              description: 'Number of orders to return'
            }
          ],
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                orders: { type: 'array' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 401,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Unauthorized'
            }
          ],
          rateLimit: {
            requestsPerSecond: 2,
            burstLimit: 40
          }
        },
        createOrder: {
          name: 'Create Order',
          method: 'POST',
          path: '/admin/api/2023-01/orders.json',
          parameters: [],
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                order: {
                  type: 'object',
                  properties: {
                    line_items: { type: 'array' },
                    customer: { type: 'object' },
                    financial_status: { type: 'string' }
                  }
                }
              },
              required: ['order']
            },
            required: true
          },
          response: {
            statusCode: 201,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                order: { type: 'object' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 422,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Unprocessable entity'
            }
          ],
          rateLimit: {
            requestsPerSecond: 2,
            burstLimit: 40
          }
        }
      },
      rateLimiting: {
        default: {
          requestsPerSecond: 2,
          burstLimit: 40
        },
        strategy: 'token-bucket',
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        }
      },
      errorHandling: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['429', '500', '502', '503', '504']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          monitoringWindow: 300000
        },
        timeout: 30000,
        validation: {
          requestValidation: true,
          responseValidation: false,
          customValidators: []
        }
      },
      testing: {
        connectionTest: {
          endpoint: '/admin/api/2023-01/shop.json',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000
        },
        endpointTests: [
          {
            name: 'Get Shop Info',
            endpoint: '/admin/api/2023-01/shop.json',
            method: 'GET',
            expectedResponse: { shop: {} },
            expectedStatus: 200
          }
        ],
        scenarios: []
      }
    };

    // Stripe Connector
    const stripeConnector: ConnectorFramework = {
      definition: {
        name: 'Stripe',
        version: '1.0.0',
        description: 'Connect to Stripe for payment processing, subscription management, and financial automation.',
        category: 'payment',
        tags: ['payment', 'billing', 'subscriptions', 'financial'],
        icon: '💳'
      },
      authentication: {
        type: 'api-key',
        configuration: {
          apiKey: {
            header: 'Authorization'
          }
        }
      },
      endpoints: {
        charges: {
          name: 'Create Charge',
          method: 'POST',
          path: '/v1/charges',
          parameters: [],
          requestBody: {
            contentType: 'application/x-www-form-urlencoded',
            schema: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                currency: { type: 'string' },
                source: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['amount', 'currency', 'source']
            },
            required: true
          },
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                status: { type: 'string' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 400,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid payment data'
            },
            {
              statusCode: 402,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Payment failed'
            }
          ],
          rateLimit: {
            requestsPerSecond: 100
          }
        },
        customers: {
          name: 'Create Customer',
          method: 'POST',
          path: '/v1/customers',
          parameters: [],
          requestBody: {
            contentType: 'application/x-www-form-urlencoded',
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
              }
            },
            required: true
          },
          response: {
            statusCode: 200,
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                created: { type: 'number' }
              }
            }
          },
          errorResponses: [
            {
              statusCode: 400,
              contentType: 'application/json',
              schema: { type: 'object' },
              description: 'Invalid customer data'
            }
          ],
          rateLimit: {
            requestsPerSecond: 100
          }
        }
      },
      rateLimiting: {
        default: {
          requestsPerSecond: 100
        },
        strategy: 'fixed',
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['500', '502', '503', '504']
        }
      },
      errorHandling: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['500', '502', '503', '504']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          monitoringWindow: 300000
        },
        timeout: 30000,
        validation: {
          requestValidation: true,
          responseValidation: false,
          customValidators: []
        }
      },
      testing: {
        connectionTest: {
          endpoint: '/v1/account',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000
        },
        endpointTests: [
          {
            name: 'Get Account Info',
            endpoint: '/v1/account',
            method: 'GET',
            expectedResponse: { id: '', business_name: '' },
            expectedStatus: 200
          }
        ],
        scenarios: []
      }
    };

    // Register all pre-built connectors
    this.registry.register(salesforceConnector);
    this.registry.register(hubspotConnector);
    this.registry.register(slackConnector);
    this.registry.register(shopifyConnector);
    this.registry.register(stripeConnector);

    this.logger.info('Pre-built connectors initialized', { 
      count: this.registry.connectors.size 
    });
  }

  private validateConnector(connector: ConnectorFramework): void {
    if (!connector.definition.name) {
      throw new Error('Connector name is required');
    }

    if (!connector.definition.category) {
      throw new Error('Connector category is required');
    }

    if (!connector.authentication.type) {
      throw new Error('Authentication type is required');
    }

    if (!connector.endpoints || Object.keys(connector.endpoints).length === 0) {
      throw new Error('At least one endpoint is required');
    }

    // Validate each endpoint
    Object.values(connector.endpoints).forEach((endpoint, index) => {
      if (!endpoint.name) {
        throw new Error(`Endpoint ${index} name is required`);
      }

      if (!endpoint.method) {
        throw new Error(`Endpoint ${endpoint.name} method is required`);
      }

      if (!endpoint.path) {
        throw new Error(`Endpoint ${endpoint.name} path is required`);
      }

      if (!endpoint.response) {
        throw new Error(`Endpoint ${endpoint.name} response definition is required`);
      }
    });
  }
}

// Connector Registry Implementation
class ConnectorRegistryImpl implements ConnectorRegistry {
  connectors: Map<string, ConnectorFramework> = new Map();
  categories: Map<string, string[]> = new Map();

  search(query: string): ConnectorFramework[] {
    const searchLower = query.toLowerCase();
    return Array.from(this.connectors.values()).filter(connector =>
      connector.definition.name.toLowerCase().includes(searchLower) ||
      connector.definition.description.toLowerCase().includes(searchLower) ||
      connector.definition.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  getByCategory(category: string): ConnectorFramework[] {
    return Array.from(this.connectors.values()).filter(
      connector => connector.definition.category === category
    );
  }

  register(connector: ConnectorFramework): void {
    const id = connector.definition.name.toLowerCase().replace(/\s+/g, '-');
    this.connectors.set(id, connector);

    // Update categories
    if (!this.categories.has(connector.definition.category)) {
      this.categories.set(connector.definition.category, []);
    }
    const categoryConnectors = this.categories.get(connector.definition.category)!;
    if (!categoryConnectors.includes(id)) {
      categoryConnectors.push(id);
    }
  }

  unregister(id: string): void {
    const connector = this.connectors.get(id);
    if (connector) {
      this.connectors.delete(id);

      // Update categories
      const categoryConnectors = this.categories.get(connector.definition.category);
      if (categoryConnectors) {
        const index = categoryConnectors.indexOf(id);
        if (index > -1) {
          categoryConnectors.splice(index, 1);
        }
        if (categoryConnectors.length === 0) {
          this.categories.delete(connector.definition.category);
        }
      }
    }
  }
}
