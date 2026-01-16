import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import { TPagination } from "../../../interface/global.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { Prisma } from "@prisma/client";

const createReview = async(user: JwtPayload, payload: any) => {
const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
       email: user.email
    }
})
const appoinmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
        id: payload.appointmentId
    }
})
if (appoinmentData.status !== 'COMPLETED') {
        throw new AppError(StatusCodes.BAD_REQUEST, "You cannot review before the appointment is completed");
    }
if (!(patientData.id === appoinmentData.patientId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "this is not your appoinment")
}

 return await prisma.$transaction(async (tx) => {
        const result = await tx.review.create({
            data: {
                appointmentId: appoinmentData.id,
                doctorId: appoinmentData.doctorId,
                patientId: appoinmentData.patientId,
                rating: payload.rating,
                comment: payload.comment
            }
        });

        const averageRating = await tx.review.aggregate({
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: result.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })

        return result;
    })

}


const getReview = async (
    filters: any,
    options: TPagination,
) => {
    const { limit, page, skip } = calculatePagination(options);
    const { patientEmail, doctorEmail } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }

    if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true,
            //appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};
const getMyReview = async (
    options: TPagination,
    user: JwtPayload
) => {
    const { limit, page, skip } = calculatePagination(options);

    const result = await prisma.review.findMany({
        where: {
            patientId: user?.id,
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true,
            appointment: true,
        },
    });

    const total = await prisma.review.count({
        where: {
            patientId: user?.id,
        },
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};


const getDoctorReview = async (
    options: TPagination,
    user: JwtPayload
) => {
    const { limit, page, skip } = calculatePagination(options);
  const doctorInfo =   await prisma.doctor.findFirstOrThrow({where: {
        email: user?.email
    }})
    const result = await prisma.review.findMany({
        where: {
            doctorId: doctorInfo?.id
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true,
            appointment: true,
        },
    });

    const total = await prisma.review.count({
        where: {
            patientId: user?.id,
        },
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const reviewServices = {
    createReview,
    getReview,
    getMyReview,
    getDoctorReview
}