-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "energyProvider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- CreateIndex
CREATE INDEX "Property_name_idx" ON "Property"("name");
