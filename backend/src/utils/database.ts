import mongoose from 'mongoose';

/**
 * Database utility functions for common operations
 */
export class DatabaseUtil {
  /**
   * Check if a document exists by ID
   */
  static async documentExists(model: mongoose.Model<any>, id: string): Promise<boolean> {
    try {
      const count = await model.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Create a new ObjectId
   */
  static createObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  /**
   * Convert string to ObjectId
   */
  static toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  /**
   * Get database collection statistics
   */
  static async getCollectionStats(collectionName: string): Promise<any> {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      // Use countDocuments instead of stats for basic collection info
      const count = await db.collection(collectionName).countDocuments();
      return { count };
    } catch (error) {
      console.error(`Error getting stats for collection ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Drop collection (use with caution)
   */
  static async dropCollection(collectionName: string): Promise<boolean> {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      await db.collection(collectionName).drop();
      return true;
    } catch (error) {
      console.error(`Error dropping collection ${collectionName}:`, error);
      return false;
    }
  }

  /**
   * Create database indexes for better performance
   */
  static async createIndexes(model: mongoose.Model<any>, indexes: any[]): Promise<void> {
    try {
      for (const index of indexes) {
        await model.collection.createIndex(index);
      }
      console.log(`✅ Indexes created for ${model.modelName}`);
    } catch (error) {
      console.error(`❌ Error creating indexes for ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Perform database transaction
   */
  static async withTransaction<T>(
    operation: (session: mongoose.ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}