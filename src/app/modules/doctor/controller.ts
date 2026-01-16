import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { DoctorServices } from "./services.js";
import { Request, Response } from "express";
import pick from "../../../shared/pick.js";
import { doctorFiltarableFields } from "./constance.js";


const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const { doctorId } = req.params;
  const result = await DoctorServices.updateDoctor(doctorId, data);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctor updated successfully",
    data: result,
  });
});


const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, doctorFiltarableFields)
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder'])
  const result = await DoctorServices.getAllDoctors(filter, options);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctors fetched successfully",
    data: result,
  });
});


const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const result = await DoctorServices.getDoctorById(doctorId);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctor fetched successfully",
    data: result,
  });
});


const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  console.log(doctorId)
  const result = await DoctorServices.softDeleteDoctor(doctorId);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});

const restoreSoftDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const result = await DoctorServices.restoreSoftDeleteDoctor(doctorId);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});


const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const result = await DoctorServices.deleteDoctor(doctorId);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const DoctorController = {
  updateDoctor,
  getAllDoctors,
  getDoctorById,
  softDeleteDoctor,
  deleteDoctor,
  restoreSoftDeleteDoctor,
};
