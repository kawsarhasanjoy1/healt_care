import {Response} from 'express'
import { TResponseData } from "../interface/global.js";
const sendResponse = <T>(res: Response, jsonData: TResponseData<T>) => {
  res.status(jsonData.status).json({
    success: jsonData.status < 400,
    meta: jsonData.meta,
    data: jsonData.data || null,
    message: jsonData.message,
  });
};


export default sendResponse