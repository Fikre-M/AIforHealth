import App from './app';
import { env } from '@/config/env';

class Server {
  private app: App;

  constructor() {
    this.app = new App();
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.app.connectDatabase();

      // Start server
      this.app.app.listen(env.PORT, () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`📍 Environment: ${env.NODE_ENV}`);
        console.log(`🔗 API Base URL: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
      
      try {
        await this.app.disconnectDatabase();
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Start server
const server = new Server();
server.start();