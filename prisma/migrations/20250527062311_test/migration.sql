/*
  Warnings:

  - You are about to drop the column `taskType` on the `Task` table. All the data in the column will be lost.
  - Added the required column `taskType` to the `ServiceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "taskType" "TaskType" NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskType";
