/*
  Warnings:

  - A unique constraint covering the columns `[referenceId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Activity_referenceId_key" ON "Activity"("referenceId");
