/*
  Warnings:

  - A unique constraint covering the columns `[serviceDetailsId]` on the table `ServiceRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "note" TEXT,
ADD COLUMN     "serviceDetailsId" TEXT;

-- CreateTable
CREATE TABLE "serviceDetails" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT,
    "serviceName" TEXT,
    "servicePrice" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "serviceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "serviceDetails_serviceRequestId_key" ON "serviceDetails"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_serviceDetailsId_key" ON "ServiceRequest"("serviceDetailsId");

-- AddForeignKey
ALTER TABLE "serviceDetails" ADD CONSTRAINT "serviceDetails_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
