#!/usr/bin/env ts-node

import { database } from '@/config/database';
import mongoose from 'mongoose';

async function showCollections() {
  try {
    // Connect to database
    await database.connect();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database Collections:');
    console.log(`Database: ${db.databaseName}`);
    console.log(`Total Collections: ${collections.length}`);
    console.log('');
    
    if (collections.length === 0) {
      console.log('No collections found. Run "npm run db:seed" to create initial data.');
    } else {
      for (const collection of collections) {
        try {
          const count = await db.collection(collection.name).countDocuments();
          console.log(`📁 ${collection.name}`);
          console.log(`   Documents: ${count}`);
          console.log('');
        } catch (error) {
          console.log(`📁 ${collection.name}`);
          console.log(`   Documents: Unable to count`);
          console.log('');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await database.disconnect();
  }
}

showCollections();