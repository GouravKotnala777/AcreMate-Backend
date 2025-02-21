import { NextFunction, Request, Response } from "express";
import Slip, { CreateSlipBodyTypes, UpdateSlipBodyTypes } from "../models/slipModel";
import { ErrorHandler } from "../utils/utilClasses";
import Plot from "../models/plotModel";
import { getMonthsCovered } from "../utils/utilFunctions";


// Get all Slips by admin
export const findAllSlips = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {skip} = req.query;
        console.log({skip});
        const allSlips = await Slip.find().skip(Number(skip)).limit(2);

        res.status(200).json({success:true, message:"All slips", jsonData:allSlips});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get single slip by admin
export const findSingleSlip = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {slipID} = req.query;

        if (!slipID)return next(new ErrorHandler("slipID not found", 404));

        const findSlipByID = await Slip.findById(slipID);

        res.status(200).json({success:true, message:"Single slip", jsonData:findSlipByID});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create slip by admin
export const createSlip = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {slipType, slipNo, modeOfPayment, amount, plotID}:CreateSlipBodyTypes = req.body;

        const isSlipExist = await Slip.findOne({
            slipNo
        });

        console.log("----------------- (1)");
        
        
        if (isSlipExist) return next(new ErrorHandler("Slip already exist", 409));
        console.log("----------------- (2)");
        
        const findPlotByID = await Plot.findById(plotID);
        console.log("----------------- (3)");
        
        if (!plotID) return next(new ErrorHandler("plotID not found", 404));
        if (!findPlotByID) return next(new ErrorHandler("Plot not found", 404));
        console.log("----------------- (4)");
        
        
        console.log({findPlotByID});
        console.log("----------------- (5)");
        
        
        const createSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, amount, clientID:findPlotByID.clientID, plotID:findPlotByID._id, agentID:findPlotByID.agentID
        });
        console.log("----------------- (6)");
        
        console.log({createSlip});
        
        console.log("----------------- (7)");
        

        const firstPayment = await Slip.findOne({
            plotID:findPlotByID._id,
            clientID:findPlotByID.clientID
        }).sort({_id:1});

        const plotTotalValue = findPlotByID.size*findPlotByID.rate;
        const emi = Math.ceil((plotTotalValue)/(findPlotByID.duration));


        console.log({A: typeof findPlotByID.shouldPay});
        console.log({B: typeof (emi * getMonthsCovered(firstPayment?.createdAt))});
        console.log({C: typeof emi});
        console.log({D: typeof getMonthsCovered(firstPayment?.createdAt)});
        

        findPlotByID.shouldPay = Number(emi * getMonthsCovered(firstPayment?.createdAt));
        findPlotByID.paid += Number(amount);
        if (findPlotByID.paid < plotTotalValue) {
            console.log("----------------- (8)");
            findPlotByID.plotStatus = "pending";
        }
        else{
            console.log("----------------- (9)");
            findPlotByID.plotStatus = "completed";
        }
        
        console.log("----------------- (10)");
        const updatePlot = await findPlotByID.save();

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