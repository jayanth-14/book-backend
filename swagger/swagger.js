const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book API Documentation',
      version: '1.0.0',
      description: 'Book API Information',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['src/routes/*.js'], // update path according to your project structure
};

const swaggerDocs = YAML.load(path.join(__dirname, 'swagger.yml'));;
module.exports = { swaggerDocs, swaggerUi };