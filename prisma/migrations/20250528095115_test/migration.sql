/*
  Warnings:

  - Made the column `location` on table `ClientProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClientProfile" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "location" SET DATA TYPE TEXT;
