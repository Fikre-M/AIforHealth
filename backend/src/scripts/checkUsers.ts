#!/usr/bin/env ts-node

import { database } from '@/config/database';
import { User } from '@/models';

async function checkUsers() {
  try {
    await database.connect();
    const users = await User.find({}, 'name email role');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await database.disconnect();
  }
}

checkUsers();