-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "isActive" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE';
