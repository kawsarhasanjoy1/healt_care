-- CreateTable
CREATE TABLE "Specialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSpecialties" (
    "specialtiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "DoctorSpecialties_pkey" PRIMARY KEY ("specialtiesId","doctorId")
);

-- AddForeignKey
ALTER TABLE "DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_specialtiesId_fkey" FOREIGN KEY ("specialtiesId") REFERENCES "Specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
