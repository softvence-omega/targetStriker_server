-- CreateTable
CREATE TABLE "Fcm_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Fcm_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fcm_token_token_key" ON "Fcm_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Fcm_token_userId_key" ON "Fcm_token"("userId");

-- AddForeignKey
ALTER TABLE "Fcm_token" ADD CONSTRAINT "Fcm_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
