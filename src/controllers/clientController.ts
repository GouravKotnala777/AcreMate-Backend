import { NextFunction, Request, Response } from "express";
import Client, { CreateClientBodyTypes } from "../models/clientModel";
import { ErrorHandler } from "../utils/utilClasses";


// Get all clients by admin
export const findAllClients = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allClients = await Client.find();

        res.status(200).json({success:true, message:"All clients", jsonData:allClients});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Get single client by admin
export const findSingleClient = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {clientID} = req.query;

        if (!clientID)return next(new ErrorHandler("clientID not found", 404));

        const findClientByID = await Client.findById(clientID);

        res.status(200).json({success:true, message:"Single client", jsonData:findClientByID});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Create new client by admin
export const createClient = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {serialNumber, name, guardian, email, gender, mobile}:CreateClientBodyTypes = req.body;

        const isClientExist = await Client.findOne({
            serialNumber
        });

        if (isClientExist) return next(new ErrorHandler("Serial no. is already in use", 409));

        const newClient = await Client.create({
            serialNumber, name, guardian, email, gender, mobile
        });

        res.status(200).json({success:true, message:"Client created", jsonData:newClient});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Cancel client by admin
export const cancelClent = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {clientID} = req.body;

        const removClient = await Client.findByIdAndUpdate(clientID, {
            ownerShipStatus:"cancelled"
        }, {new:true});

        res.status(200).json({success:true, message:"Client cancelled", jsonData:removClient});
    } catch (error) {
        console.log(error);
        next(error);
    }
};