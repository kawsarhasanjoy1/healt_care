import jwt from "jsonwebtoken";
export const createToken = async (data, secret, expire_in) => {
    return await jwt.sign(data, secret, { expiresIn: expire_in, algorithm: 'HS384' });
};
