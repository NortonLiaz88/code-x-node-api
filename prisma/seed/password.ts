import {
  CourseLevel,
  Destination,
  Interest,
  Language,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.user.update({
    where: {
      id: 1,
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log('Admin seed criado com sucesso!');
}

seedAdmin()
  .catch((error) => {
    console.error('Erro ao criar seed do admin:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
