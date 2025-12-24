#!/usr/bin/env ts-node

import { database } from '@/config/database';
import { seeder } from '@/utils/seeder';

/**
 * Database management script
 * Usage: npm run db:seed | npm run db:clear | npm run db:reset
 */

const command = process.argv[2];

async function main() {
  try {
    // Connect to database
    await database.connect();

    switch (command) {
      case 'seed':
        await seeder.seed();
        break;
      
      case 'clear':
        await seeder.clear();
        break;
      
      case 'reset':
        await seeder.reset();
        break;
      
      case 'status':
        const stats = database.getStats();
        const health = await database.healthCheck();
        console.log('📊 Database Status:');
        console.log('- Connected:', database.getConnectionStatus());
        console.log('- State:', database.getConnectionState());
        console.log('- Healthy:', health);
        console.log('- Stats:', stats);
        break;
      
      default:
        console.log('Available commands:');
        console.log('- seed: Populate database with initial data');
        console.log('- clear: Remove all data from database');
        console.log('- reset: Clear and seed database');
        console.log('- status: Show database connection status');
        break;
    }

  } catch (error) {
    console.error('❌ Database operation failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

main();