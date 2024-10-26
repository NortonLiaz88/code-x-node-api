/*
  Warnings:

  - The values [BEGINNER,INTERMEDIATE,ADVANCED] on the enum `CourseLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [JAVASCRIPT,PYTHON,JAVA,CSHARP,CPLUSPLUS,RUBY,SWIFT,GO,KOTLIN,TYPESCRIPT,RUST,DART,SCALA] on the enum `Language` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourseLevel_new" AS ENUM ('beginner', 'intermediate', 'advanced');
ALTER TABLE "Course" ALTER COLUMN "level" TYPE "CourseLevel_new" USING ("level"::text::"CourseLevel_new");
ALTER TYPE "CourseLevel" RENAME TO "CourseLevel_old";
ALTER TYPE "CourseLevel_new" RENAME TO "CourseLevel";
DROP TYPE "CourseLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('Python', 'Java', 'CPlusPlus', 'JavaScript', 'Ruby', 'R', 'CSharp', 'Kotlin', 'PHP', 'TypeScript', 'Rust', 'Perl');
ALTER TABLE "Profile" ALTER COLUMN "programmingLanguages" TYPE "Language_new"[] USING ("programmingLanguages"::text::"Language_new"[]);
ALTER TABLE "Profile" ALTER COLUMN "activeProgrammingLanguage" TYPE "Language_new" USING ("activeProgrammingLanguage"::text::"Language_new");
ALTER TABLE "Course" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "Language_old";
COMMIT;
