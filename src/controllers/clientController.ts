import { NextFunction, Request, Response } from "express";
import Client, { CreateClientBodyTypes } from "../models/clientModel";
import { ErrorHandler } from "../utils/utilClasses";
import Slip from "../models/slipModel";
import { sendSMS } from "../utils/utilFunctions";

export const sendMessageToClient = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {to, message} = req.body;

        if (!to || !message) return next(new ErrorHandler("All fields are required", 400));

        const formatedMessage = `${message}`

        const sendMessage = await sendSMS(to, formatedMessage, next);

        if (!sendMessage)  return next(new ErrorHandler("Something went wrong", 500));

        res.status(200).json({success:true, message:"message has been sent", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};