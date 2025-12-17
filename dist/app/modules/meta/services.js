import { PaymentStatus, userRole } from "@prisma/client";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma.js";
const getMetaData = async (user) => {
    let metaData;
    switch (user.role) {
        case userRole.SUPER_ADMIN:
            metaData = getSuperAdminStats();
            break;
        case userRole.SUPER_ADMIN:
            metaData = getAdminStats();
            break;
        case userRole.SUPER_ADMIN:
            metaData = getDoctorStats(user);
            break;
        case userRole.SUPER_ADMIN:
            metaData = getPatientStats(user);
            break;
        default: throw new AppError(StatusCodes.BAD_REQUEST, 'invelid role');
    }
};
const getSuperAdminStats = async () => {
    const appoinmentCount = prisma.appointment.count();
    const doctorCount = prisma.doctor.count();
    const patientCount = prisma.patient.count();
    const adminCount = prisma.admin.count();
    const paymentCount = prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });
    return { appoinmentCount, patientCount, doctorCount, adminCount, paymentCount, totalRevenue };
};
const getAdminStats = async () => {
    const appoinmentCount = prisma.appointment.count();
    const doctorCount = prisma.doctor.count();
    const patientCount = prisma.patient.count();
    const paymentCount = prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });
    return { appoinmentCount, patientCount, doctorCount, paymentCount, totalRevenue };
};
const getDoctorStats = async (user) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData.id
        }
    });
    const patientCount = await prisma.appointment.groupBy({
        by: ['patientId'],
        _count: {
            id: true
        }
    });
    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id
        }
    });
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            appointment: {
                doctorId: doctorData.id
            },
            status: PaymentStatus.PAID
        }
    });
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            doctorId: doctorData.id
        }
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));
    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCount.length,
        totalRevenue,
        formattedAppointmentStatusDistribution
    };
};
const getPatientStats = async (user) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData.id
        }
    });
    const prescriptionCount = await prisma.prescription.count({
        where: {
            patientId: patientData.id
        }
    });
    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id
        }
    });
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            patientId: patientData.id
        }
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));
    return {
        appointmentCount,
        prescriptionCount,
        reviewCount,
        formattedAppointmentStatusDistribution
    };
};
export const metaServices = {
    getMetaData
};
