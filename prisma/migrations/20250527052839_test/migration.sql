-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "workerProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
