-- CreateTable
CREATE TABLE "PaymentTerm" (
    "id" TEXT NOT NULL,
    "prePaid" BOOLEAN NOT NULL DEFAULT false,
    "postPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentTerm_pkey" PRIMARY KEY ("id")
);
