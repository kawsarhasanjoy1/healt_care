 import { Request, Response } from "express";
import pick from "../../../shared/pick.js";
import { patientServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { patientFilterableFields } from "./constance.js";
import { paginationFields } from "../admin/constance.js";


const patientFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const filter = pick(query, patientFilterableFields)
  const options = pick(query, paginationFields)
  const result = await patientServices.getPatients(filter, options)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Patients retrieved successfully",
    data: result
  });
});


const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await patientServices.getPatientById(id);

  if (!result || result.isDeleted) {
    return sendResponse(res, {
      status: StatusCodes.NOT_FOUND,
      message: "Patient not found",
      data: null,
    });
  }

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Single patient fetched successfully",
    data: result,
  });
});


const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;

  const result = await patientServices.updatePatient(id, data);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Patient updated successfully",
    data: result,
  });
});


const deletedIntoDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await patientServices.deletePatient(id);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Patient deleted successfully",
    data: result,
  });
});


const softDeletedIntoDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await patientServices.softDeletePatient(id);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Patient soft-deleted successfully",
    data: result,
  });
});

export const patientController = {
  patientFromDB,
  getByIdFromDB,
  updateIntoDB,
  deletedIntoDB,
  softDeletedIntoDB,
};
