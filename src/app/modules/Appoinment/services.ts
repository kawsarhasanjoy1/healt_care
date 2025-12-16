import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma.js";
import { v4 as uuidv4 } from 'uuid';
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { AppointmentStatus, PaymentStatus, Prisma, userRole } from "@prisma/client";
import { TPagination } from "../../../interface/global.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";

const createAppointment = async (user: JwtPayload, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId
        }
    });


    await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    });

    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
                appoinmentId: appointmentData.id
            }
        });

        // PH-HealthCare-datatime
        const today = new Date();

        const transactionId = "health_care-" + today.getFullYear() + "-" + today.getMonth() + "-" + today.getDay() + "-" + today.getHours() + "-" + today.getMinutes();
     
        await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: Number(doctorData.appoinmentFee),
                transactionId
            }
        })

        return appointmentData;
    })

    return result;
};



const getMyAppoinment = async(user: JwtPayload, filters:any, options: any) => {
    const {limit,page,skip} = calculatePagination(options);
    const { ...filterData} = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = []

    if (user.role == userRole.PATIANT) {
        andConditions.push({
            patient: {
                email: user?.email,
            }
        })
    }

    if (user.role == userRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user?.email,
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key]
            }
        }))
        andConditions.push(...filterConditions)
    }

    const whereConditions = andConditions.length > 0 ? {AND: andConditions} : {}

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        include: user?.role === userRole.PATIANT
            ? { doctor: true, schedule: true } : { patient: { include: { medicalReports: true, patientHealthData: true } }, schedule: true }
    });

    const total = await prisma.appointment.count({
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
}

const getAppoinments = async (
    filters: any,
    options: TPagination
) => {
    const { limit, page, skip } = calculatePagination(options);
    const { patientEmail, doctorEmail, ...filterData } = filters;
    const andConditions: Prisma.AppointmentWhereInput[] = [];
    if (patientEmail) {
        andConditions.push({
        patient: {
            email: patientEmail,
        }
        })
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
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
            patient: true
        }
    });
    const total = await prisma.appointment.count({
        where: whereConditions
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

const changeAppointmentStatus = async(appoinmentId: string,status: AppointmentStatus,user: JwtPayload) => {
const existAppoinment = await prisma.appointment.findUniqueOrThrow({
    where: {
    id: appoinmentId,
    },
    include: {doctor: true}})

if (user.role === userRole.DOCTOR ) {
    if (!(user.email === existAppoinment.doctor.email)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "This is not your appointment!")
    }
}

const result = await prisma.appointment.update({
    where: {
        id: existAppoinment.id,
    },
    data: {
        status: status
    }
})
return result
}


const cancelUnpaidAppoinment = async() => {
const tihrtyMinAgo = new Date(Date.now() - 1 * 60 * 1000)
const unpaidAppoinment = await prisma.appointment.findMany({
    where: {
        createdAt: {
            lte: tihrtyMinAgo
        },
        paymentStatus: PaymentStatus.UNPAID
    }
})
const unpaidAppoinmentIds = unpaidAppoinment.map((field) => (field.id))
const result = await prisma.$transaction(async(tx) => {
    await tx.payment.deleteMany({
        where: {
            appointmentId: {
                in: unpaidAppoinmentIds
            }
        }
    })
    await tx.appointment.deleteMany({
        where: {
            id: {
                in: unpaidAppoinmentIds
            }
        }
    })

    for (const appoinment of unpaidAppoinment) {
        await tx.doctorSchedules.updateMany({
        where:{
            doctorId: appoinment.doctorId,
            scheduleId: appoinment.scheduleId,
        },
        data: {
            isBooked: false
        }
    })
    }
})
return result
}

export const AppoinmentServices = {
   createAppointment,
   getMyAppoinment,
   getAppoinments,
   changeAppointmentStatus,
   cancelUnpaidAppoinment
}