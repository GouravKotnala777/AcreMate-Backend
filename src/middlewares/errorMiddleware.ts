import { Request, Response } from "express";
import { ErrorHandler } from "../utils/utilClasses";


const errorMiddleware = async(err:ErrorHandler, req:Request, res:Response) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Wrong ObjectId formate";
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
    }
    res.status(err.statusCode).json({success:false, message:err.message, jsonData:{errName:err.name, errStack:err.stack}});
};

export default errorMiddleware;