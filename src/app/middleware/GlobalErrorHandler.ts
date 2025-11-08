import { Request, Response, NextFunction } from "express";

const GlobalErrorHandler = (err: any, req:Request,res:Response,nex:NextFunction) => {
console.log("================================================", err)
}


export default GlobalErrorHandler