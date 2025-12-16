import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { paymentServices } from "./services.js";
const initPayment = catchAsync(async (req, res) => {
    const { appoinmentId } = req.params;
    const result = await paymentServices.initPayment(appoinmentId);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Payment created successfully",
        data: result
    });
});
const validatePayment = catchAsync(async (req, res) => {
    const result = await paymentServices.validatePayment(req.query);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Payment validate successfully',
        data: result,
    });
});
export const paymentController = {
    initPayment,
    validatePayment
};
