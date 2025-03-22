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

// Get 20 slips with slip numbers by admin
export const findSlipsWithSlipNoRange = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {fromSlipNo, toSlipNo} = req.query;
        console.log({fromSlipNo:Number(fromSlipNo), toSlipNo:Number(toSlipNo)});
        const allSlips = await Slip.find({
            slipNo:{
                $gte:Number(fromSlipNo),
                $lte:Number(toSlipNo)
            }
        }).populate({model:"Client", path:"clientID", select:"name guardian mobile"})
        .populate({model:"Plot", path:"plotID", select:"plotNo site"});

        res.status(200).json({success:true, message:`20 slips from ${fromSlipNo}-${toSlipNo}`, jsonData:allSlips});
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
        const {slipType, slipNo, modeOfPayment, paymentID, amount, plotID}:CreateSlipBodyTypes = req.body;

        const isSlipExist = await Slip.findOne({
            slipNo
        });
        
        if (isSlipExist) return next(new ErrorHandler("Slip already exist", 409));
        
        const findPlotByID = await Plot.findById(plotID);
        
        if (!plotID) return next(new ErrorHandler("plotID not found", 404));
        if (!findPlotByID) return next(new ErrorHandler("Plot not found", 404));
        
        const createSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, paymentID, amount, clientID:findPlotByID.clientID, plotID:findPlotByID._id, agentID:findPlotByID.agentID
        });       

        const firstPayment = await Slip.findOne({
            plotID:findPlotByID._id,
            clientID:findPlotByID.clientID
        }).sort({_id:1});

        const plotTotalValue = findPlotByID.size*findPlotByID.rate;
        const emi = Math.ceil((plotTotalValue)/(findPlotByID.duration));

        findPlotByID.shouldPay = Number(emi * getMonthsCovered(firstPayment?.createdAt));
        findPlotByID.paid += Number(amount);
        if (findPlotByID.paid < plotTotalValue) {
            findPlotByID.plotStatus = "pending";
        }
        else{
            findPlotByID.plotStatus = "completed";
        }
        
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
        const {slipID, slipType, isCancelled, cancelledFor, remark}:UpdateSlipBodyTypes = req.body;

        const existingSlip = await Slip.findById(slipID);

        if (!existingSlip) return(next(new ErrorHandler("Slip not found", 404)));

        // Check if isCancelled has changed
        const isCancelledFiledSame = (existingSlip.isCancelled === isCancelled)&&(isCancelled !== undefined)&&(isCancelled !== null);

        const updateSlipByIDandUpdate = await Slip.findByIdAndUpdate(slipID, {
            ...(slipType && {slipType}),
            ...(isCancelled !== undefined && isCancelled !== null && !isCancelledFiledSame && {isCancelled}),
            ...(cancelledFor && {cancelledFor}),
            ...(remark && {remark})
        }, {new:true});

        if (isCancelled !== undefined && isCancelled !== null && !isCancelledFiledSame) {
            if (isCancelled === true) {
                console.log("uuuuuuuuuuuuuuuuuuu", typeof isCancelled, isCancelled);
                
                const updatePlot = await Plot.findByIdAndUpdate(existingSlip.plotID, {
                    $inc:{paid:-(existingSlip.amount)}
                });
            }
            else{
                console.log("nnnnnnnnnnnnnnnnnnn", typeof isCancelled, isCancelled);
                const updatePlot = await Plot.findByIdAndUpdate(existingSlip.plotID, {
                    $inc:{paid:existingSlip.amount}
                });
            }
        }


        res.status(200).json({success:true, message:"Slip updated", jsonData:updateSlipByIDandUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};