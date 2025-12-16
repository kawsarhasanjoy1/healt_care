import { Request,Response } from "express"
import { prescriptionServices } from "./services.js"
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import pick from "../../../shared/pick.js";
import { paginationFields } from "../admin/constance.js";
const createPrescription = catchAsync(async(req:Request,res:Response) => {
const data = req.body;
const user = req.user;
const result = await prescriptionServices.createPrescription(user,data)
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "Prescription created successfully",
    data: result,
  });
})

const getMyPrescription = catchAsync(async(req:Request,res:Response) => {
  const user = req.user;
  const options = pick(req.query, paginationFields)
  const result = await prescriptionServices.getMyPrescription(user,options);
  sendResponse((res), {
    status: StatusCodes.OK,
    message: 'prescription fetched successful',
    data: result.data,
    meta: result.meta
  })
})

export const prescriptionController = {
    createPrescription,
    getMyPrescription
}