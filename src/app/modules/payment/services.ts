
import { sslServices } from "../sslServices/services.js";
import prisma from "../../../shared/prisma.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import { PaymentStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const initPayment = async(appoinmentId:string) => {
    const paymentData = await prisma.payment.findFirstOrThrow({
        where: {appointmentId: appoinmentId},
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    })

      const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.appointment.patient.name,
        email: paymentData.appointment.patient.email,
        address: paymentData.appointment.patient.address,
        phoneNumber: paymentData.appointment.patient.contactNumber
    }

    const result: any = await sslServices.createPayment(initPaymentData);
   
    return {
        paymentUrl: result.GatewayPageURL
    };
}


const validatePayment = async(payload: any) => {
if (!payload || !payload.status || !(payload.status === 'VALID') ) {
    throw new AppError(StatusCodes.CONFLICT, 'Invelid payment')
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
        })
    });

    return {
        message: "Payment success!"
    }


}

// const myPayment = async(user: JwtPayload) => {
//  await prisma.patient.findUniqueOrThrow({where: {id: user?.id,isDeleted: false}})
//  const result = await prisma.payment.findMany({where: {}})
// }

export const paymentServices = {
    initPayment,
    validatePayment
}