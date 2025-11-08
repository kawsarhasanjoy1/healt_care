/*
  Warnings:

  - Added the required column `contactNumber` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePhoto` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "profilePhoto" TEXT NOT NULL;
