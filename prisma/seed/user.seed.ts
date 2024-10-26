import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Verifique se o curso com ID 1 existe para evitar erros
  const course = await prisma.course.findUnique({ where: { id: 1 } });
  if (!course) {
    console.error('Erro: O curso com ID 1 não existe. Crie o curso primeiro.');
    return;
  }

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      username: 'admin',
      name: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      diamonds: 999999, // Valor desejado para diamonds
      experience: 99999, // Valor desejado para experience
      createdAt: new Date(),
      updatedAt: new Date(),
      userCourse: {
        create: {
          courseId: 1,
          experience: 99999,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
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
