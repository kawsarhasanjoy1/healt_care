import { Request, Response } from "express";
import { catchAsync } from "../../middleware/catchAsync.js";
import { metaServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";


const fetchDashboardMetaData = catchAsync(async (req: Request, res: Response) => {

    const user = req.user;
    const result = await metaServices.getMetaData(user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Meta data retrival successfully!",
        data: result
    })
});

export const metaController = {
    fetchDashboardMetaData
}