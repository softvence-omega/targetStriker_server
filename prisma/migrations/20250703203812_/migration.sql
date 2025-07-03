/*
  Warnings:

  - A unique constraint covering the columns `[adminProfileId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "adminProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_adminProfileId_key" ON "FileInstance"("adminProfileId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_adminProfileId_fkey" FOREIGN KEY ("adminProfileId") REFERENCES "AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
