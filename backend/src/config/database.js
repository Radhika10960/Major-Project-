import mongoose from 'mongoose';

/**
 * Connect to MongoDB with retry logic.
 * Uses MONGODB_URI from environment variables.
 * Mongoose buffers commands until connected, but we explicitly
 * await the connection so startup fails fast on misconfiguration.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });

  try {
    await mongoose.connect(uri, {
      // Mongoose 8 uses sensible defaults; override only what we need
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

/**
 * Gracefully close the database connection.
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('[DB] MongoDB connection closed gracefully');
  } catch (err) {
    console.error('[DB] Error closing MongoDB connection:', err.message);
  }
}

/**
 * Returns a summary of the current database connection state.
 */
export function getDatabaseStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;

  return {
    status: stateMap[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
