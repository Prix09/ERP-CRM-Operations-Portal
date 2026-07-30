import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const emails = ['admin@flowsphere.com', 'sales@flowsphere.com', 'warehouse@flowsphere.com', 'accounts@flowsphere.com'];
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log(`Updated password for ${email} to Admin@123`);
    } else {
      console.log(`User ${email} not found!`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
