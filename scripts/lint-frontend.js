#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get the files passed by lint-staged
const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

// Convert absolute paths to relative paths from frontend directory
const frontendFiles = files
  .filter(file => file.includes('frontend/'))
  .map(file => {
    const relativePath = path.relative(path.join(process.cwd(), 'frontend'), file);
    return relativePath;
  })
  .filter(file => !file.startsWith('..'));

if (frontendFiles.length === 0) {
  process.exit(0);
}

try {
  // Change to frontend directory and run ESLint
  process.chdir(path.join(process.cwd(), 'frontend'));
  execSync(`npx eslint --fix ${frontendFiles.join(' ')}`, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}