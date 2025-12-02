import 'dotenv/config';
import prisma from "../../../shared/prisma.js";
import bcrypt from 'bcrypt';
import { createToken } from '../../../utils/createToken.js';
import { verifyToken } from '../../../utils/verifyToken.js';
import config from '../../../config/config.js';
import { AppError } from '../../middleware/AppError.js';
import { StatusCodes } from 'http-status-codes';
import sendEmail from '../../../shared/sendEmail.js';
import { userStatus } from '../../../../generated/prisma/enums.js';
const loginUser = async (payload) => {
    const { email, password } = payload;
    const isExistUser = await prisma.users.findUnique({ where: { email: email } });
    if (!isExistUser) {
        throw new Error('This user is not found');
    }
    const matchPass = await bcrypt.compare(password, isExistUser?.password);
    if (!matchPass)
        throw new Error('password dose not match');
    const userData = {
        id: isExistUser?.id,
        email: isExistUser?.email,
        role: isExistUser?.role,
        name: isExistUser?.name
    };
    const accessToken = await createToken(userData, config.access_secret, config.access_expirein);
    const refreshToken = await createToken(userData, config.refresh_secret, config.refresh_expirein);
    return {
        accessToken,
        refreshToken,
        needPasswordCng: isExistUser?.needPasswordCng
    };
};
const refreshToken = async (token) => {
    let decodeToken;
    try {
        decodeToken = verifyToken(token, config.refresh_secret);
    }
    catch (err) {
        throw new Error('your ar not authorized');
    }
    const isExistUser = await prisma.users.findUnique({ where: { email: decodeToken?.email } });
    if (!isExistUser)
        throw new Error('user not found');
    if (isExistUser.status == 'BLOCKED')
        throw new Error('user is blocked');
    if (isExistUser.status == 'DELETED')
        throw new Error('user is deleted');
    const userData = {
        id: isExistUser?.id,
        email: isExistUser?.email,
        role: isExistUser?.role,
        name: isExistUser?.name
    };
    const accessToken = await createToken(userData, config.access_secret, config.access_expirein);
    return {
        accessToken,
        needPasswordCng: isExistUser?.needPasswordCng
    };
};
const changePassword = async (user, passwords) => {
    const isExistUser = await prisma.users.findUnique({ where: { email: user?.email } });
    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    const comparePass = await bcrypt.compare(passwords.oldPassword, isExistUser?.password);
    if (!comparePass) {
        throw new AppError(StatusCodes.CONFLICT, 'Password dose not match');
    }
    const hashPass = await bcrypt.hash(passwords.newPassword, 10);
    const updatePassword = await prisma.users.update({ where: { id: isExistUser?.id }, data: { password: hashPass, needPasswordCng: false } });
    return updatePassword;
};
const forgatePassword = async (email) => {
    const isExistUser = await prisma.users.findUnique({ where: { email: email } });
    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    const userData = {
        name: isExistUser?.name,
        id: isExistUser?.id,
        email: isExistUser?.email,
        role: isExistUser?.role,
    };
    const token = await createToken(userData, config.forgot_secret, config.forgot_expireIn);
    const resetLink = `${config.front_end_url}?userId=${isExistUser?.id}&token=${token}`;
    sendEmail(email, resetLink);
};
const resetPassword = async (token, payload) => {
    const isExistUser = await prisma.users.findUnique({ where: { id: payload?.id, status: userStatus.ACTIVE } });
    if (!isExistUser)
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    const validToken = verifyToken(token, config.forgot_secret);
    if (!validToken)
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    const hashPass = await bcrypt.hash(payload.password, 10);
    const result = await prisma.users.update({ where: { id: payload.id }, data: { password: hashPass } });
    return result;
};
export const authServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgatePassword,
    resetPassword,
};
