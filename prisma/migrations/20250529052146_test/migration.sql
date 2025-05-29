/*
  Warnings:

  - You are about to drop the column `bankName` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `taskType` on the `WorkerProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "bankName",
ADD COLUMN     "bankInfoId" TEXT;

-- AlterTable
ALTER TABLE "WorkerProfile" DROP COLUMN "taskType",
ADD COLUMN     "workerSpecialistId" TEXT;

-- CreateTable
CREATE TABLE "WorkerSpecialist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WorkerSpecialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankInfo" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "IBAN" TEXT NOT NULL,
    "BIC_or_SWIFT" TEXT NOT NULL,

    CONSTRAINT "BankInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_workerSpecialistId_fkey" FOREIGN KEY ("workerSpecialistId") REFERENCES "WorkerSpecialist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bankInfoId_fkey" FOREIGN KEY ("bankInfoId") REFERENCES "BankInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
