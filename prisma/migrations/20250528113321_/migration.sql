/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `WorkerProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userName_key" ON "WorkerProfile"("userName");
