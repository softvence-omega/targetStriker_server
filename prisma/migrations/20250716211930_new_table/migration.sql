-- CreateTable
CREATE TABLE "CompanyDetails" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CompanyDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDetails_phone_key" ON "CompanyDetails"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDetails_email_key" ON "CompanyDetails"("email");
