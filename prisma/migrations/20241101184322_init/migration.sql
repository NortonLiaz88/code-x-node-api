/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correct` to the `UserActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "referenceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "correct" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "Message";
