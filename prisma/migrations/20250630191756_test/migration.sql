-- DropIndex
DROP INDEX "FileInstance_serviceAfterId_key";

-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "beforePhotoId" TEXT;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_beforePhotoId_fkey" FOREIGN KEY ("beforePhotoId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
