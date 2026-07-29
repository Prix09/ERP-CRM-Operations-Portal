import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('✅ Connected to Database');

    app.listen(PORT, () => {
      console.log(`🚀 FlowSphere ERP API Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
