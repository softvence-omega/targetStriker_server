/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "messageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_messageId_key" ON "FileInstance"("messageId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
