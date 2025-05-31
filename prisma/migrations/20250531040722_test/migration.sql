/*
  Warnings:

  - A unique constraint covering the columns `[ServiceSignatureId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "ServiceSignatureId" TEXT;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_ServiceSignatureId_key" ON "FileInstance"("ServiceSignatureId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_ServiceSignatureId_fkey" FOREIGN KEY ("ServiceSignatureId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
