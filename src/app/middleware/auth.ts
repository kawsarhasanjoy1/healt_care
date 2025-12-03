import { NextFunction, Request,Response } from "express"
import { verifyToken } from "../../utils/verifyToken.js";
import config from "../../config/config.js";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma.js";
import { AppError } from "./AppError.js";
import { StatusCodes } from "http-status-codes";
import { userRole } from "@prisma/client";

const auth = (...userRole: userRole[] ) => {
 return async(req: Request,res: Response,next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) throw new AppError(StatusCodes.UNAUTHORIZED,'your ar not authorized')
  let decodeToken;
try{
  decodeToken = verifyToken(token,config.access_secret as string)
}
catch(err){
 throw new Error('you are not authorized')
}
  const {id, email, role ,name } = decodeToken as JwtPayload;
  const user = await prisma.users.findUnique({where: {email,id,role}})
  if (!user) throw new Error('user not found')
  if (user.status == 'BLOCKED') throw new AppError(StatusCodes.UNAUTHORIZED,'your ar not authorized')
  if (user.status == 'DELETED') throw new AppError(StatusCodes.UNAUTHORIZED,'your ar not authorized')
  if (userRole && !userRole.includes(role)) {
    throw new AppError(StatusCodes.UNAUTHORIZED,'your ar not authorized')
  }
  (req as any).user = decodeToken;
  next()
}
}

export default auth