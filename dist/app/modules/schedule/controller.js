// src/app/modules/schedule/controller.ts
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick.js";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { scheduleServices } from "./services.js";
import { scheduleFiltarableFields } from "./constance.js";
import { paginationFields } from "../admin/constance.js";
const createSchedule = catchAsync(async (req, res) => {
    const result = await scheduleServices.createScheduleIntoDB(req.body);
    sendResponse(res, {
        status: StatusCodes.CREATED,
        message: "Schedule created successfully",
        data: result,
    });
});
const getSchedules = catchAsync(async (req, res) => {
    const query = req.query;
    const user = req.user;
    console.log(query, user);
    const filters = pick(query, scheduleFiltarableFields);
    const options = pick(query, paginationFields);
    const result = await scheduleServices.getSchedulesFromDB(filters, options, user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Schedules retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const deleteSchedule = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await scheduleServices.deleteFromDB(id);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Schedule deleted successfully",
        data: result,
    });
});
export const scheduleController = {
    createSchedule,
    getSchedules,
    deleteSchedule,
};
