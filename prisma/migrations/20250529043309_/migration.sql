/*
  Warnings:

  - A unique constraint covering the columns `[workerProfileId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "workerProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_workerProfileId_key" ON "FileInstance"("workerProfileId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
