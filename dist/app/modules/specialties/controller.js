import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";
import { specialtiesServices } from "./services.js";
import pick from "../../../shared/pick.js";
import { paginationFields } from "../admin/constance.js";
const createSpecialties = catchAsync(async (req, res) => {
    const result = await specialtiesServices.createSpecialties(req);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Specialties created successful',
        data: result
    });
});
const fetchSpecialties = catchAsync(async (req, res) => {
    const filters = pick(req.query, ['searchTerm']);
    const options = pick(req.query, paginationFields);
    const result = await specialtiesServices.fetchSpecialties(filters, options);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Specialties retried successful',
        data: result
    });
});
const deleteSpecialties = catchAsync(async (req, res) => {
    const { specialtiesId } = req.params;
    const result = await specialtiesServices.deleteSpecialties(specialtiesId);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Delete Specialties successful',
        data: result
    });
});
export const specialtiesController = {
    createSpecialties,
    fetchSpecialties,
    deleteSpecialties
};
