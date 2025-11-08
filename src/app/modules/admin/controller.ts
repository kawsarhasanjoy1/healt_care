import { NextFunction, Request, Response } from "express";
import pick from "../../../shared/pick.js";
import { adminFiltarableFields, paginationFields } from "../user/constance.js";
import { adminServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";



const adminFromDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const options = pick(query, paginationFields);
    const filter = pick(query, adminFiltarableFields);
    const result = await adminServices.adminFromDB(filter, options);

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Admins retrieved successfully",
      meta: result?.meta,
      data: result?.data,
    });
  } catch (error: any) {
next(error)
  }
};


const getByIdFromDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await adminServices.getByIdFromDB(id);


    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Single admin fetched successfully",
      data: result,
    });
  } catch (error: any) {
   next(error)
  }
};



const updateIntoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await adminServices.updateIntoDB(id, data);

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Admin updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
};
}


const deletedIntoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await adminServices.deletedIntoDB(id);

    if (!result) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        message: "Admin not found or already deleted",
        data: null,
      });
    }

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error: any) {
   next(error)
  }
};



const softDeletedIntoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await adminServices.softDeletedIntoDB(id);

    sendResponse(res, {
      status: StatusCodes.OK,
      message: "Admin soft-deleted successfully",
      data: result,
    });
  } catch (error: any) {
   next(error)
  }
};

export const adminController = {
  adminFromDB,
  getByIdFromDB,
  updateIntoDB,
  deletedIntoDB,
  softDeletedIntoDB,
}
