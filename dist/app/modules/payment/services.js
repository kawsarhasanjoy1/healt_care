import { sslServices } from "../sslServices/services.js";
import prisma from "../../../shared/prisma.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import { PaymentStatus } from "@prisma/client";
const initPayment = async (appoinmentId) => {
    const paymentData = await prisma.payment.findFirstOrThrow({
        where: { id: appoinmentId },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    });
    const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.appointment.patient.name,
        email: paymentData.appointment.patient.email,
        address: paymentData.appointment.patient.address,
        phoneNumber: paymentData.appointment.patient.contactNumber
    };
    const result = await sslServices.createPayment(initPaymentData);
    return {
        paymentUrl: result.GatewayPageURL
    };
};
const validatePayment = async (payload) => {
    if (!payload || !payload.status || !(payload.status === 'VALID')) {
        throw new AppError(StatusCodes.CONFLICT, 'Invelid payment');
    }
    const response = payload;
    await prisma.$transaction(async (tx) => {
        const updatedPaymentData = await tx.payment.update({
            where: {
                transactionId: response.tran_id
            },
            data: {
                status: PaymentStatus.PAID,
                paymentGatewayData: response
            }
        });
        await tx.appointment.update({
            where: {
                id: updatedPaymentData.appointmentId
            },
            data: {
                paymentStatus: PaymentStatus.PAID
            }
        });
    });
    return {
        message: "Payment success!"
    };
};
export const paymentServices = {
    initPayment,
    validatePayment
};
