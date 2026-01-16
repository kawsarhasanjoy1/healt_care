// src/app/modules/schedule/controller.ts

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick.js";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { scheduleServices } from "./services.js";
import { scheduleFiltarableFields } from "./constance.js";
import { paginationFields } from "../admin/constance.js";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleServices.createScheduleIntoDB(req.body);

  sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "Schedule created successfully",
    data: result,
  });
});

const getSchedules = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const user = req.user;
  console.log(query,user)
  const filters = pick(query, scheduleFiltarableFields);
  const options = pick(query, paginationFields);

  const result = await scheduleServices.getSchedulesFromDB(
    filters,
    options as any,
    user
  );

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Schedules retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
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
