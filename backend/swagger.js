// swagger.js
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');

const swaggerDocument = yaml.load(fs.readFileSync('./docs/swagger.yaml', 'utf8'));

module.exports = { swaggerUi, swaggerDocument };
