import { NextFunction, Request, Response } from "express";
import Plot, { CreatePlotBodyTypes, PlotTypes, UpdatePlotBodyTypes } from "../models/plotModel";
import { ErrorHandler } from "../utils/utilClasses";
import { ObjectId } from "mongoose";
import Slip, { CreateSlipBodyTypes, SlipTypes } from "../models/slipModel";
import Client, { CreateClientBodyTypes } from "../models/clientModel";

// Get all plots by admin
export const findAllPlots = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allPlots = await Plot.find();

        res.status(200).json({success:true, message:"All plots", jsonData:allPlots});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get single plot by admin
export const findSinglePlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotID} = req.query;

        if (!plotID)return next(new ErrorHandler("plotID not found", 404));
        
        const findPlotByID = await Plot.findById(plotID);
        
        if (!findPlotByID)return next(new ErrorHandler("Plot not found", 404));

        const findFirstPayment = await Slip.findOne({
            plotID,
            clientID:findPlotByID.clientID
        }).sort({_id:1});
        const findLastPayment = await Slip.findOne({
            plotID,
            clientID:findPlotByID.clientID
        }).sort({_id:-1});
        
        res.status(200).json({success:true, message:"Single plot", jsonData:{singlePlot:findPlotByID, firstSlip:findFirstPayment, lastSlip:findLastPayment}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create plot and assign to client with new slip by admin
export const createPlotAndAssign = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotNo, size, rate, length, breath,
            site, duration, hasSold,
            agentID,


            serialNumber, name, guardian, email, gender, mobile,


            slipType, slipNo, modeOfPayment, amount
        
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes = req.body;

        const isClientExist = await Client.findOne({
            serialNumber
        });

        if (isClientExist) return next(new ErrorHandler("Serial no. is already in use", 409));

        const isPlotExist = await Plot.findOne({
            plotNo
        });

        if (isPlotExist) return next(new ErrorHandler("Plot no. is already in use", 409));

        const newClient = await Client.create({
            serialNumber, name, guardian, email, gender, mobile
        });

        if (!newClient) return next(new ErrorHandler("Internal server error for newClient", 500));


        const newPlot = await Plot.create({
            plotNo, size, rate, length, breath,
            site, clientID:newClient._id, duration, hasSold,
            shouldPay:Math.ceil(((size*rate)/duration)), paid:amount, agentID,
            plotStatus:amount < (size*rate) ? "pending" : "completed"
        });

        if (!newPlot) return next(new ErrorHandler("Internal server error for newPlot", 500));
        
        const newSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, amount, agentID, clientID:newClient._id, plotID:newPlot._id
        })
        
        if (!newSlip) return next(new ErrorHandler("Internal server error for newSlip", 500));

        res.status(200).json({success:true, message:"Plot created and assigned", jsonData:newPlot});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Assign existing plot to new client with new slip by admin
export const assignPlotToClient = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            plotID, agentID,


            serialNumber, name, guardian, email, gender, mobile,


            slipType, slipNo, modeOfPayment, amount
        
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes = req.body;

        console.log("--------------- (1)");
        
        const isClientExist = await Client.findOne({
            serialNumber
        });
        console.log("--------------- (2)");
        
        if (isClientExist) return next(new ErrorHandler("Serial no. is already in use", 409));
        console.log("--------------- (3)");
        
        const newClient = await Client.create({
            serialNumber, name, guardian, email, gender, mobile
        });
        console.log("--------------- (4)");
        
        if (!newClient) return next(new ErrorHandler("Internal server error for newClient", 500));
        
        console.log("--------------- (5)");
        console.log({plotID});
        
        const findPlotByID = await Plot.findById(plotID);

        console.log({findPlotByID});
        
        console.log("--------------- (6)");
        
        if (!findPlotByID) return next(new ErrorHandler("Internal server error for newPlot", 500));
        console.log("--------------- (7)");
        

        const plotTotalValue = findPlotByID.size*findPlotByID.rate;
        const emi = Math.ceil(plotTotalValue/findPlotByID.duration);

        findPlotByID.clientID = newClient._id;
        findPlotByID.agentID = agentID;
        findPlotByID.shouldPay = Number(emi);
        findPlotByID.paid = Number(amount);
        if (findPlotByID.paid < (findPlotByID.size*findPlotByID.rate)) {
            findPlotByID.plotStatus = "pending";
        }
        else{
            findPlotByID.plotStatus = "completed";
        }

        const updatePlot = await findPlotByID.save();


        const newSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, amount, agentID, clientID:newClient._id, plotID:updatePlot._id
        });
        console.log("--------------- (8)");
        
        if (!newSlip) return next(new ErrorHandler("Internal server error for newSlip", 500));
        console.log("--------------- (9)");
        
        res.status(200).json({success:true, message:"Plot created and assigned", jsonData:updatePlot});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Update plot by admin
export const updatePlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotID, plotNo, size, rate, length, breath, 
            clientID, duration, hasSold,
            shouldPay, paid, agentID, plotStatus}:UpdatePlotBodyTypes = req.body;

        const findPlotByIDAndUpdate = await Plot.findByIdAndUpdate(plotID, {
            ...(plotNo&&{plotNo}),
            ...(size&&{size}),
            ...(rate&&{rate}),
            ...(length&&{length}),
            ...(breath&&{breath}),
            ...(clientID&&{clientID}),
            ...(duration&&{duration}),
            ...(hasSold&&{hasSold}),
            ...(shouldPay&&{shouldPay}),
            ...(paid&&{paid}),
            ...(agentID&&{agentID}),
            ...(plotStatus&&{plotStatus})
        }, {new:true});

        if (!findPlotByIDAndUpdate) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"Plot updated", jsonData:findPlotByIDAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Delete plot by admin
export const deletePlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotID}:{plotID:ObjectId} = req.body;

        const findPlotByIDAndDelete = await Plot.findByIdAndDelete(plotID);

        if (!findPlotByIDAndDelete) return next(new ErrorHandler("Plot not exist", 404));

        res.status(200).json({success:true, message:"Plot deleted", jsonData:findPlotByIDAndDelete});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

