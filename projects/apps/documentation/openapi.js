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
  apis: ['../../functions/**/src/index.ts'], // files containing annotations as above
});

fs.writeFileSync(
  './static/openapi.json',
  JSON.stringify(openapiSpecification, null, 2),
  { encoding: 'utf8' }
);
fs.writeFileSync(
  './static/openapi.yaml',
  YAML.stringify(openapiSpecification, null, 2),
  { encoding: 'utf8' }
);
