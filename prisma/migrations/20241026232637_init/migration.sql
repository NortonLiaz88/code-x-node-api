/*
  Warnings:

  - You are about to drop the column `knowledge` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `level` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseLevel` to the `UserCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "level" "CourseLevel" NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "knowledge";

-- AlterTable
ALTER TABLE "UserCourse" ADD COLUMN     "courseLevel" "CourseLevel" NOT NULL;
