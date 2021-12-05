const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const YAML = require('yaml');

const openapiSpecification = swaggerJsdoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Eventiva Developer API',
      description:
        'Access to all the services and operation eventiva provides. You will need to use an API keep or authentication method',
      version:
        process.env.npm_package_version || require('./package.json').version,
    },
  },
  apis: ['./projects/functions/**/build/index.js'], // files containing annotations as above
});

fs.writeFileSync(
  './common/openapi.json',
  JSON.stringify(openapiSpecification, null, 2),
  { encoding: 'utf8' }
);
fs.writeFileSync(
  './common/openapi.yaml',
  YAML.stringify(openapiSpecification, null, 2),
  { encoding: 'utf8' }
);
