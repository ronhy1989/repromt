// src/config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REPROMT API - Sistema Ronhy Farfán',
      version: '1.0.0',
      description: `
        API del Sistema de Desarrollo Personal Inteligente con algoritmo Pied Piper
        
        ## Autenticación
        Para endpoints protegidos, usa el token JWT en el header:
        \`Authorization: Bearer <token>\`
        
        ## Usuario
        - Email: ronhy.farfan.1989@gmail.com
        - Password: Ronhy46096270
      `,
      contact: {
        name: 'Ronhy Farfán',
        email: 'ronhy.farfan.1989@gmail.com'
      }
    },
    servers: [
      {
        url: 'https://repromt-api-856844207258.us-central1.run.app/api',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT en el formato: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'ronhy.farfan.1989@gmail.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Ronhy46096270'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIs...'
                },
                user: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      example: 'ronhy.farfan.1989@gmail.com'
                    },
                    nombre: {
                      type: 'string',
                      example: 'Ronhy Farfán'
                    },
                    nivel_autoconocimiento: {
                      type: 'string',
                      example: 'consciente'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación de usuarios'
      },
      {
        name: 'Habits',
        description: 'Gestión de hábitos'
      },
      {
        name: 'Pied Piper',
        description: 'Algoritmo Pied Piper - Recomendaciones inteligentes'
      },
      {
        name: 'Health',
        description: 'Estado del servidor'
      }
    ]
  },
  apis: ['./src/routes/*.js'],
};

// ⚠️ CORRECCIÓN: Primero generar el spec, luego exportarlo
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;