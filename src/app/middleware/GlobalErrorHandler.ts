import { Request, Response, NextFunction } from "express";
type TErrorSourch = {
    path: string,
    message: string,
}
const GlobalErrorHandler = (err: any, req:Request,res:Response,next:NextFunction) => {

let StatusCodes = 500;
let message = err?.message || 'Something went wrong';
let errorSourch: TErrorSourch[] = [{
    path: '',
    message: err?.message
}]

res.status(StatusCodes).json({
    success: false,
    message,
    errorSourch
})
next()
}





export default GlobalErrorHandler