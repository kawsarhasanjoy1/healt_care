import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { DoctorServices } from "./services.js";
const updateDoctor = catchAsync(async (req, res) => {
    const data = (req.body);
    const { doctorId } = req.params;
    const result = await DoctorServices.updateDoctor(doctorId, data);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "doctor updated successful",
        data: result,
    });
});
export const DoctorController = {
    updateDoctor,
};
