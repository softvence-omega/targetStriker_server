/*
  Warnings:

  - Added the required column `caption` to the `ReportPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReportPhoto" ADD COLUMN     "caption" TEXT NOT NULL;
