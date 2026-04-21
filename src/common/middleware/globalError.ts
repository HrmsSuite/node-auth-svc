import { NextFunction, Request, Response } from "express";
import { Apperror } from "../utils/error.js";

export const GlobalMiddleware = (err:Error,req:Request,res:Response,next:NextFunction) => {
    if (err instanceof Apperror) {
        return res.status(err.statusCode).json({
            status:"Error",
            message:err.message
        })
    }
    return res.status(500).json({
        status:"Error",
        message:"Internal Server Error"
    })
}