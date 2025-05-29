/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `ClientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userName_key" ON "ClientProfile"("userName");
