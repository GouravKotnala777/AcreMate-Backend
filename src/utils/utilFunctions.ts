import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "./utilClasses";
import jsonWebToken, { JwtPayload } from "jsonwebtoken";
import User, { UserTypes } from "../models/userModel";
import mongoose, { Document, ObjectId } from "mongoose";
import { cookieOptions } from "./utilConstants";
import twilio from "twilio";


export const sendToken = async(
    userID:ObjectId,
    res:Response,
    next:NextFunction) => {
        try {
            const generatedToken = await jsonWebToken.sign({_id:userID}, process.env.JWT_SECRET as string, {expiresIn:"3d"});
        
            res.cookie("userToken", generatedToken, cookieOptions);
            return generatedToken;
        } catch (error) {
            console.log(error);
            next(error);
        }
};

export const sendSMS = async(to:string, body:string, next:NextFunction) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE;

    const client = twilio(accountSid, authToken);

    try {
        const message = client.messages.create({
            body,
            from:twilioPhone,
            to:`+91${to}`
        });
        console.log(message);
        return message;        
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const getMonthsCovered = (createdAt?:Date) => {
    if (!createdAt)return 0;

    const startingDate = new Date(createdAt);
    const currentDate = new Date();

    const yearDiff = currentDate.getFullYear() - startingDate.getFullYear();
    const monthDiff = currentDate.getMonth() - startingDate.getMonth();

    return yearDiff*12 + monthDiff + 1;
};