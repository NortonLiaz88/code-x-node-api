-- CreateTable
CREATE TABLE "ChatReply" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "clientMessageId" TEXT NOT NULL,
    "answer" TEXT,
    "quickReplies" TEXT[],
    "topic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatReply_chatId_clientMessageId_key" ON "ChatReply"("chatId", "clientMessageId");

-- AddForeignKey
ALTER TABLE "ChatReply" ADD CONSTRAINT "ChatReply_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
