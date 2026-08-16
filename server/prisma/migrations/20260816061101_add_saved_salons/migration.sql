-- CreateTable
CREATE TABLE "SavedSalon" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSalon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedSalon_clientId_idx" ON "SavedSalon"("clientId");

-- CreateIndex
CREATE INDEX "SavedSalon_salonId_idx" ON "SavedSalon"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedSalon_clientId_salonId_key" ON "SavedSalon"("clientId", "salonId");

-- AddForeignKey
ALTER TABLE "SavedSalon" ADD CONSTRAINT "SavedSalon_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSalon" ADD CONSTRAINT "SavedSalon_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
