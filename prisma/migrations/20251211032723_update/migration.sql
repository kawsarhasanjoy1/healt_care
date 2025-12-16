/*
  Warnings:

  - You are about to drop the column `doctorSchedulesDoctorId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `doctorSchedulesScheduleId` on the `Appointment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appoinmentId]` on the table `DoctorSchedules` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorSchedulesDoctorId_doctorSchedulesSchedul_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "doctorSchedulesDoctorId",
DROP COLUMN "doctorSchedulesScheduleId";

-- AlterTable
ALTER TABLE "DoctorSchedules" ADD COLUMN     "appoinmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorSchedules_appoinmentId_key" ON "DoctorSchedules"("appoinmentId");

-- AddForeignKey
ALTER TABLE "DoctorSchedules" ADD CONSTRAINT "DoctorSchedules_appoinmentId_fkey" FOREIGN KEY ("appoinmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
