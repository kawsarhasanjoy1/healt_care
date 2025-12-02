import { Request, Response, NextFunction } from "express";

export const parseData = (req: Request, res: Response, next: NextFunction) => {
 req.body = JSON.parse(req.body.data)
 next()
}