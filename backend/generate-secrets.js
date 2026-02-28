#!/usr/bin/env node

/**
 * Generate secure secrets for JWT tokens
 * Run: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('=' .repeat(60));

console.log('\n📋 Copy these to your Render environment variables:\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Secrets generated successfully!');
console.log('⚠️  Keep these secrets secure and never commit them to git\n');
