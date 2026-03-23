import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Torqvio API',
      version: '2.1.0',
      description: 'Durable execution platform for reliable workflows',
      contact: {
        name: 'Torqvio Team',
        email: 'support@torqvio.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8459',
        description: 'Development server'
      },
      {
        url: 'https://api.torqvio.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            name: {
              type: 'string'
            },
            avatar_url: {
              type: 'string',
              format: 'uri'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Workflow: {
          type: 'object',
          required: ['id', 'name', 'definition'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            definition: {
              type: 'object'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'archived']
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Execution: {
          type: 'object',
          required: ['id', 'workflow_id', 'status'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            workflow_id: {
              type: 'string',
              format: 'uuid'
            },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed', 'cancelled']
            },
            input: {
              type: 'object'
            },
            output: {
              type: 'object'
            },
            error: {
              type: 'string'
            },
            started_at: {
              type: 'string',
              format: 'date-time'
            },
            completed_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Webhook: {
          type: 'object',
          required: ['id', 'url', 'event_type'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            url: {
              type: 'string',
              format: 'uri'
            },
            event_type: {
              type: 'string'
            },
            secret: {
              type: 'string'
            },
            active: {
              type: 'boolean'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                request_id: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/api/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi };
