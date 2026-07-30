import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import bcrypt from 'bcryptjs';

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('✅ Connected to Database');

    // Force update production passwords on startup to ensure no mismatches
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@flowsphere.com' } });
    if (adminUser) {
      const isMatch = await bcrypt.compare('Admin@123', adminUser.password);
      if (!isMatch) {
        console.log('⚠️ Password mismatch detected on startup. Force syncing demo passwords to Admin@123...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await prisma.user.updateMany({
          where: { email: { in: ['admin@flowsphere.com', 'sales@flowsphere.com', 'warehouse@flowsphere.com', 'accounts@flowsphere.com'] } },
          data: { password: hashedPassword }
        });
        console.log('✅ Successfully patched production passwords to Admin@123');
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 FlowSphere ERP API Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
