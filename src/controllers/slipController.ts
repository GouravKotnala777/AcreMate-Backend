import { NextFunction, Request, Response } from "express";
import Slip, { CreateSlipBodyTypes, UpdateSlipBodyTypes } from "../models/slipModel";
import { ErrorHandler } from "../utils/utilClasses";


// Get all Slips by admin
export const findAllSlips = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allSlips = await Slip.find();

        res.status(200).json({success:true, message:"All slips", jsonData:allSlips});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create slip by admin
export const createSlip = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {slipType, slipNo, modeOfPayment, amount, clientID, plotID, agentID}:CreateSlipBodyTypes = req.body;

        const isSlipExist = await Slip.findOne({
            slipNo
        });
        
        if (isSlipExist) return next(new ErrorHandler("Slip already exist", 409));

        const createSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, amount, clientID, plotID, agentID
        });

        res.status(200).json({success:true, message:"Slip created", jsonData:createSlip});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Update slip by admin
export const updateSlip = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {slipID, slipType, slipNo, modeOfPayment, amount, clientID, plotID, agentID}:UpdateSlipBodyTypes = req.body;

        const updateSlipByIDandUpdate = await Slip.findByIdAndUpdate(slipID, {
            ...(slipType && {slipType}),
            ...(slipNo && {slipNo}),
            ...(modeOfPayment && {modeOfPayment}),
            ...(amount && {amount}),
            ...(clientID && {clientID}),
            ...(plotID && {plotID}),
            ...(agentID && {agentID})
        }, {new:true});

        res.status(200).json({success:true, message:"Slip updated", jsonData:updateSlipByIDandUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};