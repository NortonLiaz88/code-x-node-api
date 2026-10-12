// Idempotent seed for local development: courses, store items, a demo
// student and admin, and sample lesson templates in MongoDB.
// Runs with `yarn seed` (also `npx prisma db seed`); safe to run again.
import {
  CourseLevel,
  DayOfWeek,
  Destination,
  Interest,
  Language,
  PrismaClient,
  Role,
  TimeSlot,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { storeItems } from './store.seed';
import { lessonTemplates } from './lesson-templates';

const prisma = new PrismaClient();

const levels = [
  CourseLevel.beginner,
  CourseLevel.intermediate,
  CourseLevel.advanced,
];
const languages = Object.values(Language);

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

// Sign-up enrols new users in course 1, so Python beginner must come first.
async function seedCourses() {
  for (const level of levels) {
    for (const language of languages) {
      const exists = await prisma.course.findFirst({
        where: { language, level },
      });
      if (!exists) {
        await prisma.course.create({
          data: { name: `${language} - ${capitalize(level)}`, language, level },
        });
      }
    }
  }
}

async function seedStore() {
  for (const item of storeItems) {
    const exists = await prisma.storeItem.findFirst({
      where: { name: item.name },
    });
    if (!exists) {
      await prisma.storeItem.create({ data: item });
    }
  }
}

async function seedUser(email: string, username: string, role: Role) {
  const password = process.env.SEED_PASSWORD || 'codex123';
  const course = await prisma.course.findFirst({
    where: { language: Language.Python, level: CourseLevel.beginner },
  });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return;
  }

  await prisma.user.create({
    data: {
      email,
      username,
      role,
      password: await bcrypt.hash(password, 10),
      schedule: {
        create: {
          name: 'Estudar Python',
          icon: '🚀',
          color: '#4F46E5',
          goalCount: 3,
          goalFrequency: 1,
          days: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
          timeSlot: TimeSlot.MORNING,
          remind: true,
        },
      },
      profile: {
        create: {
          activeProgrammingLanguage: Language.Python,
          interests: [Interest.ALGORITHMS],
          destination: Destination.ACADEMIC,
          Progress: {
            create: {
              consecutiveDays: 0,
              exercises: 0,
              chat: 0,
              accumulatedDiamonds: 0,
              accumulatedExpirience: 0,
              done: 0,
              accumulatedTime: 0,
            },
          },
        },
      },
      userCourse: {
        create: {
          courseId: course.id,
          experience: 0,
          active: true,
          courseLevel: CourseLevel.beginner,
        },
      },
      userPreference: { create: {} },
    },
  });
}

// The API reads lesson templates from one collection per language in the
// "db" database and syncs them into Postgres on startup.
async function seedLessonTemplates() {
  if (!process.env.MONGO_URL) {
    console.warn('MONGO_URL not set, skipping lesson templates');
    return;
  }
  const connection = await mongoose
    .createConnection(process.env.MONGO_URL, { dbName: 'db' })
    .asPromise();
  try {
    for (const [collection, templates] of Object.entries(lessonTemplates)) {
      const model = connection.collection(collection);
      for (const template of templates) {
        await model.updateOne(
          {
            template_name: template.template_name,
            question: template.question,
          },
          { $setOnInsert: template },
          { upsert: true },
        );
      }
    }
  } finally {
    await connection.close();
  }
}

async function main() {
  await seedCourses();
  await seedStore();
  await seedUser('student@codex.local', 'student', Role.STUDENT);
  await seedUser('admin@codex.local', 'admin', Role.ADMIN);
  await seedLessonTemplates();
  console.log('Seed done. Log in as student@codex.local or admin@codex.local');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
