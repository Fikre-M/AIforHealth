#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get the files passed by lint-staged
const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

// Convert absolute paths to relative paths from backend directory
const backendFiles = files
  .filter(file => file.includes('backend/'))
  .map(file => {
    const relativePath = path.relative(path.join(process.cwd(), 'backend'), file);
    return relativePath;
  })
  .filter(file => !file.startsWith('..'));

if (backendFiles.length === 0) {
  process.exit(0);
}

try {
  // Change to backend directory and run ESLint
  process.chdir(path.join(process.cwd(), 'backend'));
  execSync(`npx eslint --fix ${backendFiles.join(' ')}`, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}