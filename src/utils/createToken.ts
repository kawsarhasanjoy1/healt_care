import { userRole } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";

type TTokenData = {
    id: string;
    email: string;
    role: userRole;
    name: string;
}



export const createToken = async(data: TTokenData, secret: Secret, expire_in: any) => {
return await jwt.sign(data, secret, {expiresIn: expire_in, algorithm: 'HS384'})
}