import { Request, Response } from "express";
import { userServices } from "./services.js";
import pick from "../../../shared/pick.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { TMulterFile } from "../../../interface/global.js";
import { paginationFields } from "../admin/constance.js";
import { userFiltarableFields } from "./constance.js";



const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getMe(req.user);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "fetched successful",
    data: result,
  });
});



const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const file:TMulterFile | undefined = req.file;
  const result = await userServices.createAdmin(payload, file);

  sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "Admin created successfully",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const file:TMulterFile | undefined = req.file;
  const result = await userServices.createDoctor(payload, file);

  sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "Doctor created successfully",
    data: result,
  });
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const file:TMulterFile | undefined = req.file;
  const result = await userServices.createPatient(payload, file);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Patient Created successfuly!",
        data: result
    })
});


const userFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const options = pick(query, paginationFields);
  const filter = pick(query, userFiltarableFields);
  const result = await userServices.userFromDB(filter, options);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Admins retrieved successfully",
    meta: result?.meta || null,
    data: result?.data || [],
  });
});




const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userServices.getByIdFromDB(id);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Single admin fetched successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const {status} = req.body;
  const result = await userServices.updateStatus(id,status);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "status updated successfully",
    data: result,
  });
});


export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  userFromDB,
  getByIdFromDB,
  updateStatus,
  getMe
};
