// src/server.ts
import App from "./app";

const app = new App();

// Connect to database and start the server
const startServer = async () => {
  try {
    await app.connectDatabase();
    app.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    await app.disconnectDatabase();
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  await app.disconnectDatabase();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start the server
startServer();
