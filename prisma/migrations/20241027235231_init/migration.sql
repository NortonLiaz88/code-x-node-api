/*
  Warnings:

  - You are about to drop the column `progressId` on the `Profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Profile_progressId_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "progressId";
