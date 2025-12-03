import pick from "../../../shared/pick.js";
import { adminServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { adminFiltarableFields, paginationFields } from "./constance.js";
const adminFromDB = catchAsync(async (req, res) => {
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
});
const getByIdFromDB = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await adminServices.getByIdFromDB(id);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Single admin fetched successfully",
        data: result,
    });
});
const updateIntoDB = catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const result = await adminServices.updateIntoDB(id, data);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Admin updated successfully",
        data: result,
    });
});
const deletedIntoDB = catchAsync(async (req, res) => {
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
});
const softDeletedIntoDB = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await adminServices.softDeletedIntoDB(id);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Admin soft-deleted successfully",
        data: result,
    });
});
export const adminController = {
    adminFromDB,
    getByIdFromDB,
    updateIntoDB,
    deletedIntoDB,
    softDeletedIntoDB,
};
