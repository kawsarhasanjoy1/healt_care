import { catchAsync } from "../../middleware/catchAsync.js";
import { bloodDonateServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
const createBloodDonate = catchAsync(async (req, res) => {
    console.log("payload", req.body);
    const result = await bloodDonateServices.createBloodDonate(req.body, req.user);
    sendResponse(res, {
        status: StatusCodes.CREATED,
        message: "আপনার রক্তদানের আবেদনটি সফলভাবে নিবন্ধিত হয়েছে। জীবন বাঁচাতে এগিয়ে আসার জন্য ধন্যবাদ!",
        data: result,
    });
});
const getAvailableDonorsForPatient = catchAsync(async (req, res) => {
    const result = await bloodDonateServices.getAvailableDonorsForPatient(req.user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "আপনার ব্লাড গ্রুপ এবং বর্তমান ঠিকানার সাথে সামঞ্জস্যপূর্ণ রক্তদাতাদের তালিকা সফলভাবে লোড হয়েছে।",
        data: result,
    });
});
const myBloodDonation = catchAsync(async (req, res) => {
    const result = await bloodDonateServices.myBloodDonation(req.user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "রক্তদাতাদের তালিকা সফলভাবে লোড হয়েছে।",
        data: result,
    });
});
export const bloodDonateController = {
    createBloodDonate,
    getAvailableDonorsForPatient,
    myBloodDonation
};
