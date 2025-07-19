-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "AdminProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_AdminProfileId_fkey" FOREIGN KEY ("AdminProfileId") REFERENCES "AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
