import { userStatus } from "@prisma/client";
import prisma from "../../../shared/prisma.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { doctorSearchableFields } from "./constance.js";
const updateDoctor = async (doctorId, payload) => {
    const { specialties, ...updateData } = payload;
    const userInfo = await prisma.doctor.findUniqueOrThrow({ where: { id: doctorId } });
    await prisma.$transaction(async (transactionClient) => {
        await transactionClient.doctor.update({ where: { id: doctorId }, data: updateData });
        if (specialties && specialties.length > 0) {
            //delete specialties
            const isDeletedTrue = specialties.filter((spacality) => spacality.isDeleted);
            for (const specality of isDeletedTrue) {
                await transactionClient.doctorSpecialties.deleteMany({ where: { doctorId: userInfo.id, specialtiesId: specality.specialtiesId } });
            }
            //create specialties
            const createSpecialties = specialties.filter((specility) => !specility.isDeleted);
            for (const specialty of createSpecialties) {
                await transactionClient.doctorSpecialties.create({ data: {
                        doctorId: userInfo?.id,
                        specialtiesId: specialty.specialtiesId
                    } });
            }
        }
    });
    const result = await prisma.doctor.findUnique({ where: { id: userInfo.id }, include: { doctorSpecialties: { include: { specialties: true } } } });
    return result;
};
const getAllDoctors = async (filter, options) => {
    const { limit, page, skip } = calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filter;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialties: {
                        title: {
                            contains: specialties,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key]
            }
        }));
        andConditions.push(...filterConditions);
    }
    andConditions.push({ isDeleted: false });
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.doctor.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    const total = await prisma.doctor.count({
        where: whereCondition
    });
    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};
//  Get single doctor by id
const getDoctorById = async (doctorId) => {
    const result = await prisma.doctor.findUniqueOrThrow({
        where: { id: doctorId },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    return result;
};
//  Soft delete doctor (only mark isDeleted = true)
const softDeleteDoctor = async (doctorId) => {
    const result = await prisma.$transaction(async (transactionClient) => {
        const softDeleteDoctor = await transactionClient.doctor.update({ where: { id: doctorId }, data: { isDeleted: true } });
        const softDeletedUser = await transactionClient.users.update({ where: { email: softDeleteDoctor?.email }, data: { status: userStatus.DELETED } });
        return { softDeleteDoctor, softDeletedUser };
    });
    return result;
};
const restoreSoftDeleteDoctor = async (doctorId) => {
    const result = await prisma.$transaction(async (transactionClient) => {
        const restoreDoctore = await transactionClient.doctor.update({ where: { id: doctorId }, data: { isDeleted: false } });
        const restoreUser = await transactionClient.users.update({ where: { email: restoreDoctore?.email }, data: { status: userStatus.ACTIVE } });
        return { restoreDoctore, restoreUser };
    });
    return result;
};
// Hard delete doctor (remove from DB + relations)
const deleteDoctor = async (doctorId) => {
    const doctorInfo = await prisma.doctor.findUnique({ where: { id: doctorId } });
    const result = await prisma.$transaction(async (tx) => {
        await tx.users.delete({ where: { email: doctorInfo?.email } });
        await tx.doctorSpecialties.deleteMany({
            where: { doctorId },
        });
        const deletedDoctor = await tx.doctor.delete({
            where: { id: doctorId },
        });
        return deletedDoctor;
    });
    return result;
};
export const DoctorServices = {
    updateDoctor,
    getAllDoctors,
    getDoctorById,
    softDeleteDoctor,
    deleteDoctor,
    restoreSoftDeleteDoctor
};
