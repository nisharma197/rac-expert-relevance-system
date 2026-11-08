import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
let isConnected = false;
export const ensureDbConnected = async () => {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
};

const startServer = async () => {
  try {
    console.log('=========================================');
    console.log(' DRDO RAC Expert Relevance Backend');
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(' Connecting to MongoDB Atlas...');
    console.log('=========================================');

    // Connect to database before listening for requests
    await ensureDbConnected();

    if (process.env.VERCEL !== '1') {
      const server = app.listen(PORT, () => {
        console.log('=========================================');
        console.log(` Server is listening on http://localhost:${PORT}`);
        console.log(` Health check: http://localhost:${PORT}/health`);
        console.log(' Ready for incoming requests');
        console.log('=========================================');
      });

      // Graceful shutdown handlers
      const handleShutdown = (signal: string) => {
        console.log(`\n[Server] ${signal} received. Initiating graceful shutdown...`);
        server.close(async () => {
          console.log('[Server] HTTP server closed');
          await disconnectDatabase();
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => handleShutdown('SIGTERM'));
      process.on('SIGINT', () => handleShutdown('SIGINT'));
    }
  } catch (error) {
    console.error('=========================================');
    console.error(' [ERROR] Database connection failed.');
    console.error(error instanceof Error ? error.message : error);
    console.error('=========================================');
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

startServer();

export default app;
