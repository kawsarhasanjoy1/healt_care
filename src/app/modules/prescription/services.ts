import { JwtPayload } from "jsonwebtoken"
import prisma from "../../../shared/prisma.js"
import { AppointmentStatus, PaymentStatus } from "@prisma/client"
import { AppError } from "../../middleware/AppError.js"
import { StatusCodes } from "http-status-codes"
import { calculatePagination } from "../../../helpers/paginationHelpers.js"

const createPrescription = async(user: JwtPayload,payload:any) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID
        },
        include: {
            doctor: true
        }
    })
console.log(user)
if (!(user?.email === appointmentData?.doctor?.email)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "This is not your appointment!")
    };

    const result = await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpDate: payload.followUpDate || null || undefined
        },
        include: {
            patient: true
        }
    });


    return result;
}

const getMyPrescription = async(user: JwtPayload,options: any ) => {
    console.log(user)
const {limit,skip, sortBy,sortOrder,page} = calculatePagination(options)
const patientData = await prisma.prescription.findMany({
    where:{
        patient: {
            email: user.email
        }
    },
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? {[options.sortBy]: options.sortOrder} : {createdAt: 'asc'},
    include: {
        appointment:true,
        doctor:true,
        patient:{
            include: {
                patientHealthData: true
            }
        }
    }
})

const total = await prisma.prescription.count();

return {
    data: patientData,
    meta: {
        page,
        skip,
        limit,
        total
    }
}

}

export const prescriptionServices = {
    createPrescription,
    getMyPrescription,
}