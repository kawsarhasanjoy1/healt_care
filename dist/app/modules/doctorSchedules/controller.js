import { catchAsync } from "../../middleware/catchAsync.js";
import { doctorSchedulesServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick.js";
import { scheduleFilterableFields } from "./constance.js";
const createDoctorSchedules = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await doctorSchedulesServices.createDoctorSchedules(user, req.body);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Doctor Schedules created successfull",
        data: result
    });
});
const getMySchedule = catchAsync(async (req, res) => {
    const filters = pick(req.query, ['startDate', 'endDate', 'isBooked']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const user = req.user;
    const result = await doctorSchedulesServices.getMySchedule(filters, options, user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "My Schedule fetched successfully!",
        data: result
    });
});
const getAllDoctorScheduleFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await doctorSchedulesServices.getAllDoctorScheduleFromDB(filters, options);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Doctor Schedule retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});
const deleteFromDB = catchAsync(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const result = await doctorSchedulesServices.deleteFromDB(user, id);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "My Schedule deleted successfully!",
        data: result
    });
});
export const doctorSchedulesController = {
    createDoctorSchedules,
    getMySchedule,
    getAllDoctorScheduleFromDB,
    deleteFromDB,
};
