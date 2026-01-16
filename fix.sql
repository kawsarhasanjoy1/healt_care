-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."BloodGroup" AS ENUM ('A_POSITIVE', 'B_POSITIVE', 'O_POSITIVE', 'AB_POSITIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE', 'AB_NEGATIVE');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('MARRIED', 'UNMARRIED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."userRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PATIANT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "public"."userStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL DEFAULT '',
    "contactNumber" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "videoCallingId" TEXT NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BloodDonate" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "bloodGroup" "public"."BloodGroup" NOT NULL,
    "address" TEXT NOT NULL,
    "lastDonationDate" TIMESTAMP(3),
    "donatedBags" INTEGER NOT NULL DEFAULT 1,
    "nowDonateBags" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodDonate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BloodRequest" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "bloodDonateId" TEXT NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gender" "public"."Gender" NOT NULL,
    "appoinmentFee" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "currentWorkingPlace" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorSchedules" (
    "doctorId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "appoinmentId" TEXT,

    CONSTRAINT "DoctorSchedules_pkey" PRIMARY KEY ("doctorId","scheduleId")
);

-- CreateTable
CREATE TABLE "public"."DoctorSpecialties" (
    "specialtiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "DoctorSpecialties_pkey" PRIMARY KEY ("specialtiesId","doctorId")
);

-- CreateTable
CREATE TABLE "public"."MedicalReport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "reportLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "address" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isDonor" BOOLEAN NOT NULL DEFAULT false,
    "isNeedBlood" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientHealthData" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "bloodGroup" "public"."BloodGroup" NOT NULL,
    "hasAllergies" BOOLEAN DEFAULT false,
    "hasDiabetes" BOOLEAN DEFAULT false,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "smokingStatus" BOOLEAN DEFAULT false,
    "dietaryPreferences" TEXT,
    "pregnancyStatus" BOOLEAN DEFAULT false,
    "mentalHealthHistory" TEXT,
    "immunizationStatus" TEXT,
    "hasPastSurgeries" BOOLEAN DEFAULT false,
    "recentAnxiety" BOOLEAN DEFAULT false,
    "recentDepression" BOOLEAN DEFAULT false,
    "maritalStatus" "public"."MaritalStatus" NOT NULL DEFAULT 'UNMARRIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientHealthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentGatewayData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Specialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'No description provided',
    "icon" TEXT NOT NULL,

    CONSTRAINT "Specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '123456',
    "profilePhoto" TEXT DEFAULT '',
    "contactNumber" TEXT NOT NULL,
    "needPasswordCng" BOOLEAN NOT NULL DEFAULT true,
    "role" "public"."userRole" NOT NULL DEFAULT 'PATIANT',
    "status" "public"."userStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_doctorId_scheduleId_key" ON "public"."Appointment"("doctorId" ASC, "scheduleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BloodRequest_patientId_bloodDonateId_key" ON "public"."BloodRequest"("patientId" ASC, "bloodDonateId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "public"."Doctor"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorSchedules_appoinmentId_key" ON "public"."DoctorSchedules"("appoinmentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "public"."Patient"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_id_key" ON "public"."Patient"("id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PatientHealthData_patientId_key" ON "public"."PatientHealthData"("patientId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "public"."Payment"("appointmentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_appointmentId_key" ON "public"."Prescription"("appointmentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_appointmentId_key" ON "public"."Review"("appointmentId" ASC);

-- CreateIndex
CREATE INDEX "Specialties_title_description_idx" ON "public"."Specialties"("title" ASC, "description" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodDonate" ADD CONSTRAINT "BloodDonate_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodRequest" ADD CONSTRAINT "BloodRequest_bloodDonateId_fkey" FOREIGN KEY ("bloodDonateId") REFERENCES "public"."BloodDonate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodRequest" ADD CONSTRAINT "BloodRequest_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodRequest" ADD CONSTRAINT "BloodRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorSchedules" ADD CONSTRAINT "DoctorSchedules_appoinmentId_fkey" FOREIGN KEY ("appoinmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorSchedules" ADD CONSTRAINT "DoctorSchedules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorSchedules" ADD CONSTRAINT "DoctorSchedules_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_specialtiesId_fkey" FOREIGN KEY ("specialtiesId") REFERENCES "public"."Specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalReport" ADD CONSTRAINT "MedicalReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientHealthData" ADD CONSTRAINT "PatientHealthData_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

