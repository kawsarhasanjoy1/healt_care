import bcrypt from 'bcrypt';
import { userRole } from '../../constance/global.js';
import { calculatePagination } from '../../../helpers/paginationHelpers.js';
import prisma from '../../../shared/prisma.js';
import { imageUploadeIntoCloudinary } from '../../../helpers/multer.js';
import { userSearchableFields } from './constance.js';
import { AppError } from '../../middleware/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { userStatus } from '@prisma/client';
const getMe = async (payload) => {
    const profileInfo = await prisma.users.findFirstOrThrow({
        where: { id: payload?.id },
    });
    if (profileInfo?.role === "DOCTOR") {
        const doctorInfo = await prisma.doctor.findUnique({
            where: { email: profileInfo.email },
            include: {
                doctorSpecialties: { include: { specialties: true } },
                user: true,
            },
        });
        return { ...profileInfo, ...doctorInfo };
    }
    if (profileInfo?.role === userRole.PATIANT) {
        const patientInfo = await prisma.patient.findUnique({
            where: { email: profileInfo.email },
            include: { user: true, patientHealthData: true, medicalReports: true },
        });
        return { ...profileInfo, ...patientInfo };
    }
    if (profileInfo?.role === userRole.ADMIN || profileInfo?.role === userRole.SUPER_ADMIN) {
        const adminInfo = await prisma.admin.findUnique({
            where: { email: profileInfo.email },
            include: { user: true },
        });
        return { ...profileInfo, ...adminInfo };
    }
    throw new AppError(StatusCodes.CONFLICT, "invalid role");
};
const createAdmin = async (payload, file) => {
    const { admin, password } = payload;
    if (file) {
        const cloudinary = await imageUploadeIntoCloudinary(file);
        payload.admin.profilePhoto = cloudinary.secure_url;
    }
    const hashPass = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (transactionClient) => {
        const user = await transactionClient.users.create({
            data: {
                name: admin.name,
                email: admin.email,
                password: hashPass,
                profilePhoto: payload.admin.profilePhoto,
                contactNumber: admin.contactNumber,
                role: userRole.ADMIN,
                status: userStatus.ACTIVE,
            },
        });
        const adminRow = await transactionClient.admin.create({
            data: {
                name: admin.name,
                email: admin.email,
                profilePhoto: payload.admin.profilePhoto,
                contactNumber: admin.contactNumber,
            },
        });
        return { user, admin: adminRow };
    });
    return result;
};
const createDoctor = async (payload, file) => {
    const { doctor, password } = payload;
    if (file) {
        const cloudinary = await imageUploadeIntoCloudinary(file);
        payload.doctor.profilePhoto = cloudinary.secure_url;
    }
    const hashPass = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (transactionClient) => {
        const user = await transactionClient.users.create({
            data: {
                name: doctor.name,
                email: doctor.email,
                password: hashPass,
                profilePhoto: payload.doctor.profilePhoto,
                contactNumber: doctor.contactNumber,
                role: userRole.DOCTOR,
            },
        });
        const doctorRes = await transactionClient.doctor.create({
            data: {
                name: doctor.name,
                email: doctor.email,
                contactNumber: doctor.contactNumber,
                profilePhoto: doctor.profilePhoto,
                address: doctor.address,
                registrationNumber: doctor.registrationNumber,
                experience: doctor.experience,
                gender: doctor.gender,
                appoinmentFee: doctor.appoinmentFee,
                qualification: doctor.qualification,
                currentWorkingPlace: doctor.currentWorkingPlace,
                designation: doctor.designation,
                isDeleted: doctor.isDeleted
            },
        });
        return { user, doctor: doctorRes };
    });
    return result;
};
const createPatient = async (payload, file) => {
    const { patient, password } = payload;
    if (file) {
        const cloudinary = await imageUploadeIntoCloudinary(file);
        payload.patient.profilePhoto = cloudinary?.secure_url;
    }
    const hashPass = await bcrypt.hash(password, 12);
    const userData = {
        name: patient.name,
        email: patient.email,
        password: hashPass,
        profilePhoto: patient.profilePhoto,
        contactNumber: patient.contactNumber,
        role: userRole.PATIANT,
    };
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.users.create({
            data: userData
        });
        const createdPatientData = await transactionClient.patient.create({
            data: patient
        });
        return createdPatientData;
    });
    return result;
};
const userFromDB = async (query, options) => {
    const { searchTerm, ...rawFilter } = query;
    const filter = Object.fromEntries(Object.entries(rawFilter).filter(([, v]) => v !== "" && v !== undefined && v !== null));
    const { page, limit, skip, sortOrder, sortBy } = calculatePagination(options);
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: userSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: 'insensitive' }
            }))
        });
    }
    if (Object.keys(filter).length > 0) {
        andCondition.push({
            AND: Object.keys(filter).map((key) => ({
                [key]: {
                    equals: filter[key]
                }
            }))
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = await prisma.users.findMany({ where: whereCondition,
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            role: true,
            needPasswordCng: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            doctor: true,
            admin: true
        },
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" }
    });
    const total = await prisma.users.count({ where: whereCondition });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
};
const getByIdFromDB = async (id) => {
    const result = await prisma.users.findUniqueOrThrow({ where: { id, status: userStatus.ACTIVE } });
    return result;
};
const updateStatus = async (id, status) => {
    const isExistUser = await prisma.users.findUniqueOrThrow({ where: { id: id } });
    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'user not found');
    }
    const result = await prisma.users.update({ where: { id: id }, data: { status: status } });
    return result;
};
const updateProfile = async (user, payload, file) => {
    const userInfo = await prisma.users.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });
    if (file) {
        const uploadToCloudinary = await imageUploadeIntoCloudinary(file);
        payload.profilePhoto = uploadToCloudinary?.secure_url;
    }
    if ('email' in payload) {
        delete payload.email;
    }
    const result = await prisma.$transaction(async (tx) => {
        const userUpdateData = {};
        if (payload.name !== undefined) {
            userUpdateData.name = payload.name;
        }
        if (payload.contactNumber !== undefined) {
            userUpdateData.contactNumber = payload.contactNumber;
        }
        if (payload.profilePhoto !== undefined) {
            userUpdateData.profilePhoto = payload.profilePhoto;
        }
        let updatedUser = userInfo;
        if (Object.keys(userUpdateData).length > 0) {
            updatedUser = await tx.users.update({
                where: { email: userInfo.email },
                data: userUpdateData,
            });
        }
        let profileInfo;
        if (userInfo.role === userRole.SUPER_ADMIN ||
            userInfo.role === userRole.ADMIN) {
            profileInfo = await tx.admin.update({
                where: { email: userInfo.email },
                data: payload,
            });
        }
        else if (userInfo.role === userRole.DOCTOR) {
            profileInfo = await tx.doctor.update({
                where: { email: userInfo.email },
                data: payload,
            });
        }
        else if (userInfo.role === userRole.PATIANT) {
            profileInfo = await tx.patient.update({
                where: { email: userInfo.email },
                data: payload,
            });
        }
        return {
            user: updatedUser,
            profile: profileInfo,
        };
    });
    return {
        user: result.user,
        profile: result.profile,
    };
};
export const userServices = {
    getMe,
    createAdmin,
    createDoctor,
    createPatient,
    userFromDB,
    getByIdFromDB,
    updateStatus,
    updateProfile
};
