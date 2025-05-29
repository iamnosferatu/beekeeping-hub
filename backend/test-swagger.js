const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
  },
  apis: [path.join(__dirname, 'src/routes/*.js')],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

console.log('Swagger spec generated:');
console.log('Number of paths:', Object.keys(swaggerSpec.paths || {}).length);
console.log('Paths found:', Object.keys(swaggerSpec.paths || {}));
console.log('\nFirst few paths:');
console.log(JSON.stringify(swaggerSpec.paths, null, 2).substring(0, 500));

// Also try with absolute path pattern
const absolutePattern = path.join(__dirname, 'src', 'routes', '*.js');
console.log('\nTrying with absolute pattern:', absolutePattern);

const swaggerOptions2 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
  },
  apis: [absolutePattern],
};

const swaggerSpec2 = swaggerJsDoc(swaggerOptions2);
console.log('Number of paths with absolute pattern:', Object.keys(swaggerSpec2.paths || {}).length);