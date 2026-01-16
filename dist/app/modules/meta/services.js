import { PaymentStatus, userRole } from "@prisma/client";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma.js";
const getMetaData = async (user) => {
    let metaData;
    switch (user.role) {
        case userRole.SUPER_ADMIN:
            metaData = await getSuperAdminStats();
            break;
        case userRole.SUPER_ADMIN:
            metaData = await getAdminStats();
            break;
        case userRole.DOCTOR:
            metaData = await getDoctorStats(user);
            break;
        case userRole.PATIANT:
            metaData = await getPatientStats(user);
            break;
        default: throw new AppError(StatusCodes.BAD_REQUEST, 'invelid role');
    }
    return metaData;
};
const getSuperAdminStats = async () => {
    const appoinmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();
    const barChart = await getBarChartData();
    const pieChart = await getPieChartData();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });
    return { appoinmentCount, patientCount, doctorCount, adminCount, paymentCount, totalRevenue, barChart, pieChart };
};
const getAdminStats = async () => {
    const appoinmentCount = prisma.appointment.count();
    const doctorCount = prisma.doctor.count();
    const patientCount = prisma.patient.count();
    const paymentCount = prisma.payment.count();
    const barChart = await getBarChartData();
    const pieChart = await getPieChartData();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });
    return { appoinmentCount, patientCount, doctorCount, paymentCount, totalRevenue, barChart, pieChart };
};
const getDoctorStats = async (user) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { email: user?.email }
    });
    const appointmentCount = await prisma.appointment.count({
        where: { doctorId: doctorData.id }
    });
    const patientCountGroup = await prisma.appointment.groupBy({
        by: ['patientId'],
        where: { doctorId: doctorData.id }
    });
    const reviewCount = await prisma.review.count({
        where: { doctorId: doctorData.id }
    });
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            appointment: { doctorId: doctorData.id },
            status: PaymentStatus.PAID
        }
    });
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { doctorId: doctorData.id }
    });
    const monthlyAppointments = await prisma.$queryRaw `
        SELECT 
            DATE_TRUNC('month', "createdAt") AS month,
            CAST(COUNT(*) AS INTEGER) AS count
        FROM "Appointment"
        WHERE "doctorId" = ${doctorData.id}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
    `;
    const formattedMonthlyAppointments = monthlyAppointments.map(item => ({
        month: new Date(item.month).toLocaleString('en-US', { month: 'short' }),
        count: item.count
    }));
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));
    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCountGroup.length,
        totalRevenue: totalRevenue._sum.amount || 0,
        formattedAppointmentStatusDistribution,
        monthlyAppointments: formattedMonthlyAppointments
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
const getBarChartData = async () => {
    const appoinmentCountByMonth = await prisma.$queryRaw `
        SELECT 
            DATE_TRUNC('month', "createdAt") AS month,
            CAST(COUNT(*) AS INTEGER) AS count
        FROM "Appointment" 
        GROUP BY DATE_TRUNC('month', "createdAt") 
        ORDER BY month ASC
    `;
    return appoinmentCountByMonth;
};
const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));
    return formattedAppointmentStatusDistribution;
};
export const metaServices = {
    getMetaData
};
