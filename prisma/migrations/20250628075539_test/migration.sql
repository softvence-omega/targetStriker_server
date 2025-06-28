-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('IN_PROGRESS', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'IN_PROGRESS';
