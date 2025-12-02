

import { Request,Response } from "express";
import { authServices } from "./services.js";
import sendResponse from "../../../shared/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../middleware/catchAsync.js";

const loginUser = catchAsync(async(req: Request, res: Response) => {
const result = await authServices.loginUser(req.body)
const {accessToken, refreshToken, needPasswordCng} = result;
res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: false,
     path: '/'
    })
sendResponse(res,{
    status: StatusCodes.OK,
    message: 'User login successful',
    data: {
        accessToken,
        needPasswordCng
    }
})
})


const refreshToken = catchAsync(async (req:Request,res: Response) => {
const {refreshToken} = req.cookies;
const result = await authServices.refreshToken(refreshToken)
sendResponse(res,{
    status: StatusCodes.OK,
    message: 'create token by refresh token',
    data: result
})
})

const changePassword = catchAsync(async(req:Request,res:Response) => {
    const user = req.user;
    const {oldPassword,newPassword} = req.body;
    const password = {
        oldPassword,newPassword
    }
    console.log(user,password)
    const result = await authServices.changePassword(user, password )
    sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Password change successful',
        data: result
    })
})

const forgatePassword = catchAsync(async(req:Request,res:Response) => {
    const {email} = req.body
    const result = await authServices.forgatePassword(email)
     sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Password forgot successful',
        data: result
    })
})
const resetPassword = catchAsync(async(req:Request,res:Response) => {
    const {id,password} = req.body
    const token = req.headers.authorization || ""
    const result = await authServices.resetPassword(token,{id,password})
     sendResponse(res, {
        status: StatusCodes.OK,
        message: 'Password reset successful',
        data: result
    })
})


export const authController = {
    loginUser,
    refreshToken,
    changePassword,
    forgatePassword,
    resetPassword
}