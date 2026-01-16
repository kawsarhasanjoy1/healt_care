import { catchAsync } from "../../middleware/catchAsync.js";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { TAuthUser } from "../../../interface/global.js";
import { bloodRequestServices } from "./servicest.js";

const createBloodRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await bloodRequestServices.createBloodRequest(
    req.body,
    req.user as TAuthUser
  );

  sendResponse(res, {
    status: StatusCodes.CREATED,
    message:
      "আপনার রক্তের অনুরোধটি ডোনারের কাছে সফলভাবে পাঠানো হয়েছে এবং ইমেইল নোটিফিকেশন দেওয়া হয়েছে।",
    data: result,
  });
});

const getMyRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await bloodRequestServices.getMyRequest(req.user as TAuthUser);

  sendResponse(res, {
    status: StatusCodes.OK,
    message: "আপনার কাছে আসা পেন্ডিং অনুরোধগুলো সফলভাবে লোড হয়েছে।",
    data: result,
  });
});

const upBloodRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const result = await bloodRequestServices.upBloodRequestStatus(
    requestId,
    status,
    req.user as TAuthUser
  );

  sendResponse(res, {
    status: StatusCodes.OK,
    message:
      "অভিনন্দন! আপনি অনুরোধটি গ্রহণ করেছেন। এখন প্যাসেন্ট আপনার সাথে যোগাযোগ করতে পারবে।",
    data: result,
  });
});

const incomingBloodRequest = catchAsync(async (req: Request, res: Response) => {
  const { result, meta } = await bloodRequestServices.incomingBloodRequest(
    req.user as TAuthUser
  );

  sendResponse(res, {
    status: StatusCodes.OK,
    message:
      "অভিনন্দন! আপনি অনুরোধটি গ্রহণ করেছেন। এখন প্যাসেন্ট আপনার সাথে যোগাযোগ করতে পারবে।",
    data: result,
    meta: meta as any,
  });
});
// const deleteRq = catchAsync(async (req: Request, res: Response) => {
//   const { requestId } = req.params;
//   const result = await bloodRequestServices.deleteRq(
//     requestId
//   );

//   sendResponse(res, {
//     status: StatusCodes.OK,
//     message:
//       "অভিনন্দন! আপনি অনুরোধটি গ্রহণ করেছেন। এখন প্যাসেন্ট আপনার সাথে যোগাযোগ করতে পারবে।",
//     data: result,
//   });
// });

export const bloodRequestController = {
  createBloodRequest,
  getMyRequest,
  incomingBloodRequest,
  upBloodRequestStatus,
};
