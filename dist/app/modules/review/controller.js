import { catchAsync } from "../../middleware/catchAsync.js";
import { reviewServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick.js";
import { paginationFields } from "../admin/constance.js";
import { reviewFilterableFields } from "./constance.js";
const createReview = catchAsync(async (req, res) => {
    const user = req.user;
    const data = req.body;
    const result = await reviewServices.createReview(user, data);
    sendResponse((res), {
        status: StatusCodes.OK,
        message: 'Review created successful',
        data: result
    });
});
const getReview = catchAsync(async (req, res) => {
    const options = pick(req.query, paginationFields);
    const filters = pick(req.query, reviewFilterableFields);
    const result = await reviewServices.getReview(filters, options);
    sendResponse((res), {
        status: StatusCodes.OK,
        message: 'Review retried successful',
        data: result
    });
});
const getMyReview = catchAsync(async (req, res) => {
    const options = pick(req.query, paginationFields);
    const user = req?.user;
    const result = await reviewServices.getMyReview(options, user);
    sendResponse((res), {
        status: StatusCodes.OK,
        message: 'Review retried successful',
        data: result
    });
});
const getDoctorReview = catchAsync(async (req, res) => {
    const options = pick(req.query, paginationFields);
    const user = req?.user;
    const result = await reviewServices.getDoctorReview(options, user);
    sendResponse((res), {
        status: StatusCodes.OK,
        message: 'Doctor review retried successful',
        data: result
    });
});
export const reviewController = {
    createReview,
    getReview,
    getMyReview,
    getDoctorReview
};
