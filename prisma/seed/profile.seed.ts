import {
  CourseLevel,
  Destination,
  Interest,
  Language,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function seedProfile() {
 
 const profile = await prisma.profile.create({
    data: {
      activeProgrammingLanguage: Language.Python,
      destination: Destination.ACADEMIC,
      interests: Interest.ALGORITHMS,
      user: {
        connect: {
          id: 1,
        },
      }
    },
  });

  const progress = await prisma.progress.create({
    data: {
      accumulatedDiamonds: 9999999,
      accumulatedExpirience: 9999999,
      accumulatedTime: 9999999,
      chat: 0,
      consecutiveDays: 0,
      done: 0,
      exercises: 0,
      profile: {
        connect: {
          id: profile.id,
        },
      }
    },
  });
}
seedProfile()
  .catch((error) => {
    console.error('Erro ao criar seed do admin:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
