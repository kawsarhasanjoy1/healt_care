/*
  Warnings:

  - A unique constraint covering the columns `[patientId,bloodDonateId]` on the table `BloodRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BloodRequest_patientId_bloodDonateId_key" ON "BloodRequest"("patientId", "bloodDonateId");
