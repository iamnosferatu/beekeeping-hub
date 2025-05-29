const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beekeeping Hub API',
      version: '1.0.0',
      description: 'A modern blog application API for beekeeping enthusiasts',
      contact: {
        name: 'Beekeeping Hub Team',
        email: 'support@beekeepinghub.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server'
      },
      {
        url: 'https://api.beekeepinghub.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'author', 'admin'] },
            bio: { type: 'string' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string' },
            featured_image: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published'] },
            userId: { type: 'integer' },
            author: { $ref: '#/components/schemas/User' },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' }
            },
            likes: { type: 'integer' },
            isLiked: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            userId: { type: 'integer' },
            articleId: { type: 'integer' },
            parentId: { type: 'integer', nullable: true },
            author: { $ref: '#/components/schemas/User' },
            replies: {
              type: 'array',
              items: { $ref: '#/components/schemas/Comment' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ForbiddenError: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Articles',
        description: 'Article CRUD operations'
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints'
      },
      {
        name: 'Tags',
        description: 'Tag-related endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin role required)'
      }
    ]
  },
  apis: [__dirname + '/../routes/*.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Debug: Log the number of paths found
if (process.env.NODE_ENV === 'development') {
  console.log('Swagger paths found:', Object.keys(swaggerSpec.paths || {}).length);
  console.log('Available endpoints:', Object.keys(swaggerSpec.paths || {}));
}

module.exports = swaggerSpec;