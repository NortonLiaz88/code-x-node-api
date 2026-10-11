-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "topic" TEXT;

-- CreateIndex
CREATE INDEX "Chat_profileId_lastMessageAt_idx" ON "Chat"("profileId", "lastMessageAt");
