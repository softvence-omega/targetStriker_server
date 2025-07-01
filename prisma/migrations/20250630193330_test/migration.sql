/*
  Warnings:

  - A unique constraint covering the columns `[reportPhotoId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "reportPhotoId" TEXT;

-- CreateTable
CREATE TABLE "ReportPhoto" (
    "id" TEXT NOT NULL,
    "isPrev" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReportPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_reportPhotoId_key" ON "FileInstance"("reportPhotoId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_reportPhotoId_fkey" FOREIGN KEY ("reportPhotoId") REFERENCES "ReportPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
