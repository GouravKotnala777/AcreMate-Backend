import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilClasses";
import jsonWebToken, { JwtPayload } from "jsonwebtoken";
import User, { UserTypes } from "../models/userModel";
import mongoose, { Document } from "mongoose";

export interface AuthReqTypes extends Request {
    user:UserTypes;
}

export const isUserAuthenticated = async(req:Request, _:Response, next:NextFunction) => {
    try {
        const token = req.cookies.userToken || req.headers.cookie?.split(" ")[1];
    
        if (!token) return next(new ErrorHandler("Token not found", 404));
        
        const verifyToken = await jsonWebToken.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        const findUserByUserID = await User.findById(verifyToken._id);
        
        if (!findUserByUserID) return next(new ErrorHandler("User not found", 404));
    
        (req as AuthReqTypes).user = findUserByUserID;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};