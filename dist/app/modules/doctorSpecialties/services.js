// src/app/modules/doctorSpecialties/doctorSpecialties.service.ts
import prisma from "../../../shared/prisma.js";
const createDoctorSpecialty = async (payload) => {
    const { doctorId, specialtiesId } = payload;
    const result = await prisma.doctorSpecialties.create({
        data: {
            doctorId,
            specialtiesId,
        },
    });
    return result;
};
const deleteDoctorSpecialty = async (doctorId, specialtiesId) => {
    const result = await prisma.doctorSpecialties.delete({
        where: {
            specialtiesId_doctorId: {
                specialtiesId,
                doctorId,
            },
        },
    });
    return result;
};
const getDoctorSpecialtiesByDoctor = async (doctorId) => {
    const result = await prisma.doctorSpecialties.findMany({
        where: { doctorId },
        include: {
            specialties: true,
        },
    });
    return result;
};
const getDoctorSpecialtiesBySpecialty = async (specialtiesId) => {
    const result = await prisma.doctorSpecialties.findMany({
        where: { specialtiesId },
        include: {
            doctors: true,
        },
    });
    return result;
};
const getAllDoctorSpecialties = async () => {
    const result = await prisma.doctorSpecialties.findMany({
        include: {
            specialties: true,
            doctors: true,
        },
    });
    return result;
};
export const DoctorSpecialtiesService = {
    createDoctorSpecialty,
    deleteDoctorSpecialty,
    getDoctorSpecialtiesByDoctor,
    getDoctorSpecialtiesBySpecialty,
    getAllDoctorSpecialties,
};
