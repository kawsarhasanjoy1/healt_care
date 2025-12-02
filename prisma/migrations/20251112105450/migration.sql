-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "profilePhoto" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "password" SET DEFAULT '123456',
ALTER COLUMN "role" SET DEFAULT 'PATIANT',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "profilePhoto" SET DEFAULT '';

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gender" "Gender" NOT NULL,
    "appoinmentFee" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "currentWorkingPlace" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_email_fkey" FOREIGN KEY ("email") REFERENCES "Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
