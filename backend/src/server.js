import config from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import app from './app.js';

const PORT = config.port;

/**
 * Start the server after establishing a database connection.
 */
async function start() {
  try {
    // Connect to MongoDB first
    await connectDatabase();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 PR Quality Reporter API`);
      console.log(`   Environment : ${config.nodeEnv}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/api/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully…`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
