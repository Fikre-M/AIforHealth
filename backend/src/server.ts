import App from './app';
import { startKeepAlive, stopKeepAlive } from './utils/keepAlive';

const app = new App();

// Connect to database and start the server
const startServer = async () => {
  try {
    await app.connectDatabase();
    app.start();
    startKeepAlive();
  } catch (error) {
    console.error('Failed to start server:', error);
    await app.disconnectDatabase();
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log('Shutting down server...');
  stopKeepAlive();
  await app.disconnectDatabase();
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown();
});
process.on('SIGINT', () => {
  void shutdown();
});

// Start the server
void startServer();
