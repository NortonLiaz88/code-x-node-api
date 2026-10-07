import {
  CourseLevel,
  DayOfWeek,
  Destination,
  Interest,
  Language,
  PrismaClient,
  TimeSlot,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  
  const schedule = await prisma.schedule.create({
    data: {
      color: '#000000',
      goalCount: 10,
      goalFrequency: 10,
      icon: '🚀',
      name: 'Meta 1',
      timeSlot: TimeSlot.MORNING,
      userId: 1,
      days: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
      remind: true,
    },
  });

  console.log('Admin Schedule seed criado com sucesso!', schedule);
}

seedAdmin()
  .catch((error) => {
    console.error('Erro ao criar seed do admin:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
