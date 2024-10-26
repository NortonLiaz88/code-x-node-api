/*
  Warnings:

  - The values [CPlusPlus,CSharp] on the enum `Language` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('Python', 'Java', 'C++', 'JavaScript', 'Ruby', 'R', 'C#', 'Kotlin', 'PHP', 'TypeScript', 'Rust', 'Perl');
ALTER TABLE "Profile" ALTER COLUMN "programmingLanguages" TYPE "Language_new"[] USING ("programmingLanguages"::text::"Language_new"[]);
ALTER TABLE "Profile" ALTER COLUMN "activeProgrammingLanguage" TYPE "Language_new" USING ("activeProgrammingLanguage"::text::"Language_new");
ALTER TABLE "Course" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "Language_old";
COMMIT;
