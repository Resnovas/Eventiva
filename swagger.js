const swaggerJsdoc = require('swagger-jsdoc');

const openapiSpecification = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eventiva Developer API',
      description: 'Access to all the services and operation eventiva provides. You will need to use an API keep or authentication method',
      version: '1.0.0',
    },
  },
  apis: ['.src/functions/domain/lib/index.js'], // files containing annotations as above
});

console.log(openapiSpecification)