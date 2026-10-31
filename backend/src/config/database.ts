import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using the connection string from environment variables.
 */
export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    throw new Error(
      'MONGODB_URI is not defined in environment variables. Please add MONGODB_URI to your .env file.'
    );
  }

  if (mongoUri.includes('<db_password>') || mongoUri.includes('<password>')) {
    throw new Error(
      'MONGODB_URI contains a password placeholder (<db_password>). Please replace it with your actual MongoDB Atlas database user password in your .env file.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(
      `[Database] MongoDB connected successfully: host=${conn.connection.host}, database=${conn.connection.name || 'default'}`
    );
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Gracefully disconnects from MongoDB.
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected successfully');
  }
};

/**
 * Returns the human-readable status of the MongoDB connection.
 */
export const getDatabaseStatus = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

// Setup connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[Database] Mongoose connection event: connected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Mongoose connection error event:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose connection event: disconnected');
});
