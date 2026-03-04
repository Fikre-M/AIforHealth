// Production start script
require('dotenv').config();

// Setup module alias for @ paths to work with compiled JS
const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@': path.join(__dirname, 'dist'),
  '@/config': path.join(__dirname, 'dist/config'),
  '@/middleware': path.join(__dirname, 'dist/middleware'),
  '@/models': path.join(__dirname, 'dist/models'),
  '@/routes': path.join(__dirname, 'dist/routes'),
  '@/services': path.join(__dirname, 'dist/services'),
  '@/utils': path.join(__dirname, 'dist/utils'),
  '@/types': path.join(__dirname, 'dist/types'),
  '@/features': path.join(__dirname, 'dist/features'),
  '@/test': path.join(__dirname, 'dist/test')
});

// Start the compiled server
require('./dist/server.js');