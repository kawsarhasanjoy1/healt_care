import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { DoctorServices } from "./services.js";
import { Request,Response } from "express";


const updateDoctor = catchAsync(async(req:Request,res:Response) => {
const data =(req.body);
const {doctorId} = req.params;
const result = await DoctorServices.updateDoctor(doctorId,data)
sendResponse(res, {
    status: StatusCodes.OK,
    message: "doctor updated successful",
    data: result,
})
})

export const DoctorController = {
    updateDoctor,
}