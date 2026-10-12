-- CreateTable
CREATE TABLE "TutorMetric" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "firstTextMs" INTEGER,
    "replyChars" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT,
    "model" TEXT,
    "streamed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorMetric_createdAt_idx" ON "TutorMetric"("createdAt");

-- CreateIndex
CREATE INDEX "TutorMetric_chatId_idx" ON "TutorMetric"("chatId");

-- AddForeignKey
ALTER TABLE "TutorMetric" ADD CONSTRAINT "TutorMetric_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
