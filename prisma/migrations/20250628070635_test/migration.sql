-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "dateIssued" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duaDate" TIMESTAMP(3);
