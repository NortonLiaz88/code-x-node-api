import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const levels = ['beginner', 'intermediate', 'advanced'];
const programming_languages = [
    "Python", "Java", "CPlusPlus", "JavaScript", "Ruby", 
    "R", "CSharp", "Kotlin", 
    "PHP", "TypeScript", "Rust", "Perl",
];

async function seedCourses() {
  for (const level of levels) {
    for (const language of programming_languages) {
      await prisma.course.create({
        data: {
          name: `${language} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
          language: language as any, // cast para corresponder ao enum Language
          level: level as any, // cast para corresponder ao enum CourseLevel
        },
      });
    }
  }

  console.log('Seed para cursos criada com sucesso!');
}

seedCourses()
  .catch((error) => {
    console.error('Erro ao criar seed de cursos:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
