/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `WorkerSpecialist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkerSpecialist_name_key" ON "WorkerSpecialist"("name");
