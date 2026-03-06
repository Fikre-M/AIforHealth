import mongoose, { ConnectOptions } from 'mongoose';
import { env, isTest, isProduction } from './env';

interface DatabaseStats {
  connectionCount: number;
  lastConnected: Date | null;
  lastDisconnected: Date | null;
  reconnectAttempts: number;
}

class Database {
  private static instance: Database;
  private isConnected = false;
  private connectionRetries = 0;
  private maxRetries = 5;
  private retryDelay = 5000; // 5 seconds
  private stats: DatabaseStats = {
    connectionCount: 0,
    lastConnected: null,
    lastDisconnected: null,
    reconnectAttempts: 0,
  };

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private getConnectionOptions(): ConnectOptions {
    const baseOptions: ConnectOptions = {
      maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
      minPoolSize: env.MONGODB_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
      maxIdleTimeMS: env.MONGODB_MAX_IDLE_TIME_MS,
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    };

    // Production-specific optimizations
    if (isProduction()) {
      return {
        ...baseOptions,
        retryWrites: env.MONGODB_RETRY_WRITES,
        w: env.MONGODB_WRITE_CONCERN as any, // Write concern for data safety
        readPreference: 'primaryPreferred',
        compressors: ['zlib'], // Enable compression
      };
    }

    return baseOptions;
  }

  private setupEventListeners(): void {
    // Connection successful
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.connectionRetries = 0;
      this.stats.connectionCount++;
      this.stats.lastConnected = new Date();
      console.log(`✅ MongoDB connected successfully to ${isTest() ? 'test' : 'main'} database`);
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
      this.isConnected = false;
      
      // Attempt reconnection in development/test
      if (!isProduction && this.connectionRetries < this.maxRetries) {
        this.attemptReconnection();
      }
    });

    // Connection lost
    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.stats.lastDisconnected = new Date();
      console.log('⚠️ MongoDB disconnected');
      
      // Attempt reconnection if not intentional
      if (!isProduction && this.connectionRetries < this.maxRetries) {
        this.attemptReconnection();
      }
    });

    // Reconnection successful
    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      this.connectionRetries = 0;
      this.stats.reconnectAttempts++;
      console.log('✅ MongoDB reconnected successfully');
    });

    // Process termination handlers
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  private async attemptReconnection(): Promise<void> {
    this.connectionRetries++;
    this.stats.reconnectAttempts++;
    
    console.log(`🔄 Attempting to reconnect to MongoDB (${this.connectionRetries}/${this.maxRetries})...`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error(`❌ Reconnection attempt ${this.connectionRetries} failed:`, error);
        
        if (this.connectionRetries >= this.maxRetries) {
          console.error('❌ Max reconnection attempts reached. Manual intervention required.');
        }
      }
    }, this.retryDelay * this.connectionRetries); // Exponential backoff
  }

  public async connect(): Promise<void> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      console.log('📡 Database already connected');
      return;
    }

    try {
      const uri = isTest() ? env.MONGODB_TEST_URI || env.MONGODB_URI : env.MONGODB_URI;
      
      // Validate MongoDB URI
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      
      // Ensure URI uses proper format to avoid deprecation warnings
      const cleanUri = this.normalizeMongoUri(uri);
      
      const options = this.getConnectionOptions();
      
      console.log(`🔌 Connecting to MongoDB ${isTest() ? 'test' : 'main'} database...`);
      console.log(`📍 Connection URI: ${this.maskPassword(cleanUri)}`);
      
      await mongoose.connect(cleanUri, options);
      
      // Verify connection
      await this.healthCheck();
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize MongoDB URI to avoid deprecation warnings
   * Ensures proper URL format without legacy url.parse() issues
   */
  private normalizeMongoUri(uri: string): string {
    try {
      // Parse and reconstruct URI using WHATWG URL API
      const url = new URL(uri);
      
      // Ensure required query parameters for modern MongoDB driver
      if (!url.searchParams.has('retryWrites')) {
        url.searchParams.set('retryWrites', 'true');
      }
      if (!url.searchParams.has('w')) {
        url.searchParams.set('w', 'majority');
      }
      
      return url.toString();
    } catch (error) {
      // If URL parsing fails, return original URI
      console.warn('⚠️  Could not normalize MongoDB URI, using as-is');
      return uri;
    }
  }

  /**
   * Mask password in URI for logging
   */
  private maskPassword(uri: string): string {
    try {
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    } catch {
      return uri;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected && mongoose.connection.readyState === 0) {
      console.log('📡 Database already disconnected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw new Error(`Database disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const adminDb = mongoose.connection.db?.admin();
      if (!adminDb) {
        throw new Error('Admin database not available');
      }
      
      await adminDb.ping();
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  public getStats(): DatabaseStats & { currentState: string } {
    return {
      ...this.stats,
      currentState: this.getConnectionState(),
    };
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('🔄 Gracefully shutting down database connection...');
    try {
      await this.disconnect();
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
    }
  }
}

export const database = Database.getInstance();

// Export utility functions for external use
export const connectDatabase = () => database.connect();
export const disconnectDatabase = () => database.disconnect();
export const getDatabaseStats = () => database.getStats();
export const checkDatabaseHealth = () => database.healthCheck();