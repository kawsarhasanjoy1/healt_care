-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_bloodDonateId_fkey" FOREIGN KEY ("bloodDonateId") REFERENCES "BloodDonate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
