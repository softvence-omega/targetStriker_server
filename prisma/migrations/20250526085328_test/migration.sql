/*
  Warnings:

  - You are about to drop the column `taskType` on the `ServiceRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" DROP COLUMN "taskType";

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "taskType" "TaskType" NOT NULL,
    "price" INTEGER NOT NULL,
    "serviceRequestId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
