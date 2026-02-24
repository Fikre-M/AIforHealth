// Simple dev server runner that bypasses TypeScript compilation
require('dotenv').config();

// Setup module alias for @ paths
const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@': path.join(__dirname, 'src'),
  '@/config': path.join(__dirname, 'src/config'),
  '@/middleware': path.join(__dirname, 'src/middleware'),
  '@/models': path.join(__dirname, 'src/models'),
  '@/routes': path.join(__dirname, 'src/routes'),
  '@/services': path.join(__dirname, 'src/services'),
  '@/utils': path.join(__dirname, 'src/utils'),
  '@/types': path.join(__dirname, 'src/types'),
  '@/features': path.join(__dirname, 'src/features'),
  '@/test': path.join(__dirname, 'src/test')
});

// Register ts-node with transpile-only mode
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
    esModuleInterop: true,
    skipLibCheck: true,
    strict: false
  }
});

// Start the server
require('./src/server.ts');
