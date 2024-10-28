/*
  Warnings:

  - A unique constraint covering the columns `[progressId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `progressId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "progressId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "profileId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_progressId_key" ON "Profile"("progressId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_profileId_key" ON "Progress"("profileId");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
