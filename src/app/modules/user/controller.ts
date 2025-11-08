import { NextFunction, Request, Response } from "express";
import { userServices } from "./services.js";
import pick from "../../../shared/pick.js";
import { adminFiltarableFields, paginationFields } from "./constance.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";


const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const result = await userServices.createAdmin(payload);

    sendResponse(res, {
      status: StatusCodes.CREATED,
      message: "Admin created successfully",
      data: result,
    });
  } catch (error: any) {
   next(error)
  }
};



const userFromDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const options = pick(query, paginationFields);
    const filter = pick(query, adminFiltarableFields);
    const result = await userServices.userFromDB(filter, options);

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Admins retrieved successfully",
      meta: result?.meta || null,
      data: result?.data || [],
    });
  } catch (error: any) {
   next(error)
  }
};



const getByIdFromDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await userServices.getByIdFromDB(id);

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Single admin fetched successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
};

export const userController = {
  createAdmin,
  userFromDB,
  getByIdFromDB,
};
