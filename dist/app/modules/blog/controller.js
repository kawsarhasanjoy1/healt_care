import { catchAsync } from "../../middleware/catchAsync.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { blogServices } from "./services.js";
import pick from "../../../shared/pick.js";
import { paginationFields } from "../admin/constance.js";
const createBlog = catchAsync(async (req, res) => {
    const files = req.files;
    const result = await blogServices.createBlog(req.body, req.user, files);
    sendResponse(res, {
        status: StatusCodes.CREATED,
        message: "ব্লগ সফলভাবে তৈরি হয়েছে",
        data: result,
    });
});
const getAllBlogs = catchAsync(async (req, res) => {
    const user = req.user;
    const query = req.query;
    const filter = pick(query, ["title", "content"]);
    const options = pick(query, paginationFields);
    const result = await blogServices.getAllBlogs(filter, options, user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "ব্লগগুলো সফলভাবে আনা হয়েছে",
        data: result,
    });
});
const getAllPublicBlog = catchAsync(async (req, res) => {
    const query = req.query;
    const options = pick(query, paginationFields);
    const result = await blogServices.getAllPublicBlog(options);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "ব্লগগুলো সফলভাবে আনা হয়েছে",
        data: result,
    });
});
const getSingleBlog = catchAsync(async (req, res) => {
    const result = await blogServices.getSingleBlog(req.params.blogId);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "ব্লগটি পাওয়া গিয়েছে",
        data: result,
    });
});
const updateBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await blogServices.updateBlog(id, req.body, user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "ব্লগটি আপডেট করা হয়েছে",
        data: result,
    });
});
const deleteBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    await blogServices.deleteBlog(id, user);
    sendResponse(res, {
        status: StatusCodes.OK,
        message: "ব্লগটি মুছে ফেলা হয়েছে",
        data: null,
    });
});
export const blogControllers = {
    createBlog,
    getAllBlogs,
    getAllPublicBlog,
    getSingleBlog,
    updateBlog,
    deleteBlog,
};
