-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('code_organization', 'multiple_choice', 'code_completion_exercise');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'code_organization';
