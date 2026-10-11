import { PrismaClient, Role } from '@prisma/client';

// Usage: yarn admin:grant someone@example.com
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error('Usage: yarn admin:grant <email>');
  }
  const user = await prisma.user.update({
    where: { email },
    data: { role: Role.ADMIN },
  });
  console.log(`${user.email} is now an admin (log in again to get the role)`);
}

main().finally(() => prisma.$disconnect());
