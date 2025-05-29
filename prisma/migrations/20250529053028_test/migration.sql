/*
  Warnings:

  - You are about to drop the column `taskType` on the `ServiceRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" DROP COLUMN "taskType",
ADD COLUMN     "taskTypeId" TEXT;

-- DropEnum
DROP TYPE "TaskType";

-- CreateTable
CREATE TABLE "TaskType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TaskType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskType_name_key" ON "TaskType"("name");

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_taskTypeId_fkey" FOREIGN KEY ("taskTypeId") REFERENCES "TaskType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
