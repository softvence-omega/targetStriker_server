/*
  Warnings:

  - Added the required column `preferredTime` to the `ServiceRequest` table without a default value. This is not possible if the table is not empty.
  - Made the column `preferredDate` on table `ServiceRequest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" DROP COLUMN "preferredTime",
ADD COLUMN     "preferredTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "preferredDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "name" TEXT NOT NULL;
