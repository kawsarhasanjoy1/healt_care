import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { Request,Response } from "express";
import { AppoinmentServices } from "./services.js";
import pick from "../../../shared/pick.js";
import { paginationFields } from "../admin/constance.js";
import { appointmentFilterableFields } from "./constance.js";

const createAppoinment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await AppoinmentServices.createAppointment(user,req.body)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Appoinment created successfully",
    data: result
  });
});


const getMyAppoinment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;
  const filters = pick(query,appointmentFilterableFields)
  const options = pick(query,paginationFields)
  const result = await AppoinmentServices.getMyAppoinment(user,filters,options)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Appoinment retried successfully",
    data: result
  });
});
const getAppoinments = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const filters = pick(query,appointmentFilterableFields)
  const options = pick(query,paginationFields)
  const result = await AppoinmentServices.getAppoinments(filters,options)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Appoinment retried successfully",
    data: result
  });
});
const changeAppoinmentStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { appointmentId } = req.params;
  const status = req.body;
  const result = await AppoinmentServices.changeAppointmentStatus(appointmentId,status,user)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Appoinment status changeg successfully",
    data: result
  });
});



export const appoinmentController = {
    createAppoinment,
    getMyAppoinment,
    getAppoinments,
    changeAppoinmentStatus
}