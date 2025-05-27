/*
  Warnings:

  - A unique constraint covering the columns `[serviceAfterId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "serviceAfterId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_serviceAfterId_key" ON "FileInstance"("serviceAfterId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_serviceAfterId_fkey" FOREIGN KEY ("serviceAfterId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
