import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "./utilClasses";
import jsonWebToken, { JwtPayload } from "jsonwebtoken";
import User, { UserTypes } from "../models/userModel";
import mongoose, { Document, ObjectId } from "mongoose";
import { cookieOptions } from "./utilConstants";


export const sendToken = async(
    userID:ObjectId,
    res:Response,
    next:NextFunction) => {
        try {
            const generatedToken = await jsonWebToken.sign({_id:userID}, "thisissecret", {expiresIn:"3d"});
        
            res.cookie("userToken", generatedToken, cookieOptions);
            return generatedToken;
        } catch (error) {
            console.log(error);
            next(error);
        }
};