import { userServices } from "./services.js";
import pick from "../../../shared/pick.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { paginationFields } from "../admin/constance.js";
import { userFiltarableFields } from "./constance.js";
const getMe = catchAsync(async (req, res) => {
    const result = await userServices.getMe(req.user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "fetched successful",
        data: result,
    });
});
const createAdmin = catchAsync(async (req, res) => {
    const payload = req.body;
    const file = req.file;
    const result = await userServices.createAdmin(payload, file);
    sendResponse(res, {
        status: StatusCodes.CREATED,
        message: "Admin created successfully",
        data: result,
    });
});
const createDoctor = catchAsync(async (req, res) => {
    const payload = req.body;
    const file = req.file;
    const result = await userServices.createDoctor(payload, file);
    sendResponse(res, {
        status: StatusCodes.CREATED,
        message: "Doctor created successfully",
        data: result,
    });
});
const userFromDB = catchAsync(async (req, res) => {
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
const getByIdFromDB = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await userServices.getByIdFromDB(id);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "Single admin fetched successfully",
        data: result,
    });
});
const updateStatus = catchAsync(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const result = await userServices.updateStatus(id, status);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "status updated successfully",
        data: result,
    });
});
export const userController = {
    createAdmin,
    createDoctor,
    userFromDB,
    getByIdFromDB,
    updateStatus,
    getMe
};
