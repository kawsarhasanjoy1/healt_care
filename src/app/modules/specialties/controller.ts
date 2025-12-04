

import { Request,Response } from "express";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { specialtiesServices } from "./services.js";

const createSpecialties = catchAsync(async(req: Request, res: Response) => {
const result = await specialtiesServices.createSpecialties(req)

sendResponse(res,{
    status: StatusCodes.OK,
    message: 'Specialties created successful',
    data: result
})
})
const fetchSpecialties = catchAsync(async(req: Request, res: Response) => {
const result = await specialtiesServices.fetchSpecialties()

sendResponse(res,{
    status: StatusCodes.OK,
    message: 'Specialties retried successful',
    data: result
})
})
const deleteSpecialties = catchAsync(async(req: Request, res: Response) => {
const {specialtiesId} = req.params;
const result = await specialtiesServices.deleteSpecialties(specialtiesId)

sendResponse(res,{
    status: StatusCodes.OK,
    message: 'Delete Specialties successful',
    data: result
})
})




export const specialtiesController = {
 createSpecialties,
 fetchSpecialties,
 deleteSpecialties
}