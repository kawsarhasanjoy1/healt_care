import 'dotenv/config'
import prisma from "../../../shared/prisma.js";
import { TLogin } from "./interface.js";
import bcrypt from 'bcrypt'
import { createToken } from '../../../utils/createToken.js';
import { verifyToken } from '../../../utils/verifyToken.js';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config/config.js';
import { AppError } from '../../middleware/AppError.js';
import { StatusCodes } from 'http-status-codes';
import sendEmail from '../../../shared/sendEmail.js';
import { userStatus } from '@prisma/client';

const loginUser = async(payload: TLogin) => {
const {email,password} = payload;
const isExistUser = await prisma.users.findUnique({where: {email: email}})
if (!isExistUser) {
   throw new Error('This user is not found')
}
const matchPass: boolean = await bcrypt.compare(password, isExistUser?.password)
if (!matchPass) throw new Error('password dose not match')
const userData = {
   id: isExistUser?.id,
   email: isExistUser?.email,
   role: isExistUser?.role,
   name: isExistUser?.name 
} 

const accessToken = await createToken(userData, config.access_secret as string,  config.access_expirein as string);
const refreshToken = await createToken(userData, config.refresh_secret as string,  config.refresh_expirein as string);

return {
    accessToken,
    refreshToken,
    needPasswordCng: isExistUser?.needPasswordCng
}

}


const refreshToken = async(token: string) => {
    let decodeToken;
    try{
       decodeToken = verifyToken(token, config.refresh_secret as Secret) as JwtPayload
    }catch(err){
        throw new Error('your ar not authorized')
    }
  const isExistUser = await prisma.users.findUnique({where: {email: decodeToken?.email}})
  if (!isExistUser) throw new Error('user not found')
  if (isExistUser.status == 'BLOCKED') throw new Error('user is blocked')
  if (isExistUser.status == 'DELETED') throw new Error('user is deleted')
    
  const userData = {
   id: isExistUser?.id,
   email: isExistUser?.email,
   role: isExistUser?.role,
   name: isExistUser?.name 
} 
const accessToken = await createToken(userData, config.access_secret as string,  config.access_expirein as string);
return {
    accessToken,
    needPasswordCng: isExistUser?.needPasswordCng
}
}


const changePassword = async(user: Record<string,any>, passwords: {oldPassword:string, newPassword: string}) => {
 const isExistUser = await prisma.users.findUnique({where: {email: user?.email}})
 if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND , "User not found")
 }
 const comparePass = await bcrypt.compare(passwords.oldPassword, isExistUser?.password);
 if (!comparePass) {
    throw new AppError(StatusCodes.CONFLICT, 'Password dose not match')
 }
 const hashPass = await bcrypt.hash(passwords.newPassword, 10)
 const updatePassword = await prisma.users.update({where: {id: isExistUser?.id},data: {password: hashPass, needPasswordCng: false}})
 return updatePassword;
}


const forgatePassword = async(email: string) => {
    const isExistUser = await prisma.users.findUnique({where: {email: email}});
    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }
const userData = {
    name: isExistUser?.name,
    id: isExistUser?.id,
    email: isExistUser?.email,
    role: isExistUser?.role, 
}
const token = await createToken(userData, config.forgot_secret as string, config.forgot_expireIn  )

const resetLink = `${config.front_end_url}?userId=${isExistUser?.id}&token=${token}`
sendEmail(email, resetLink)
}



const resetPassword = async(token: string, payload: {id: string, password: string}) => {
const isExistUser = await prisma.users.findUnique({where: {id: payload?.id, status: userStatus.ACTIVE}});
    if (!isExistUser) throw new AppError(StatusCodes.NOT_FOUND, "User not found")
const validToken =  verifyToken(token,config.forgot_secret as Secret)
    if (!validToken) throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized')

const hashPass = await bcrypt.hash(payload.password, 10);
const result = await prisma.users.update({where: {id: payload.id},data: {password: hashPass}})
return result;

}


export const authServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgatePassword,
    resetPassword,
}