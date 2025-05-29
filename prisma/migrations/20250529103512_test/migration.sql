-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PREPAID', 'POSTPAID');

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'POSTPAID';
