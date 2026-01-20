import { Request, Response } from "express";
import { catchAsync } from "../../middleware/catchAsync.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { blogServices } from "./services.js";
import { TAuthUser } from "../../../interface/global.js";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as any;
  const result = await blogServices.createBlog(
    req.body,
    req.user as TAuthUser,
    files
  );

  sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "ব্লগ সফলভাবে তৈরি হয়েছে",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await blogServices.getAllBlogs(req.query);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "সব ব্লগ পাওয়া গেছে",
    data: result,
  });
});
const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await blogServices.getSingleBlog(req.params.blogId);
  sendResponse(res, {
    status: StatusCodes.OK,
    message: "সব ব্লগ পাওয়া গেছে",
    data: result,
  });
});

export const blogController = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
};
