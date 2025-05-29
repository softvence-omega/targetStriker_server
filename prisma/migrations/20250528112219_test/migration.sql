/*
  Warnings:

  - You are about to drop the column `userName` on the `ClientProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ClientProfile_userName_key";

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "userName";
