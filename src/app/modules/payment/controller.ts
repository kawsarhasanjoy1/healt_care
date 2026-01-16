import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { Request,Response } from "express";
import { paymentServices } from "./services.js";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const {appointmentId} = req.params
  const result = await paymentServices.initPayment(appointmentId)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Payment created successfully",
    data: result
  });
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentServices.validatePayment(req.query);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Payment validate successfully',
        data: result,
    });
});
// const myPayment = catchAsync(async (req: Request, res: Response) => {
//     const result = await paymentServices.validatePayment(req.user);
//     sendResponse(res, {
//         status: StatusCodes.OK,
//         message: 'My payment retried successfully',
//         data: result,
//     });
// });

export const paymentController = {
    initPayment,
    validatePayment,
    // myPayment
}