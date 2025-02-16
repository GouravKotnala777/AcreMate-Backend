import { NextFunction, Request, Response } from "express";
import Plot, { CreatePlotBodyTypes, UpdatePlotBodyTypes } from "../models/plotModel";
import { ErrorHandler } from "../utils/utilClasses";
import mongoose, { ObjectId } from "mongoose";

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

        res.status(200).json({success:true, message:"Single plot", jsonData:findPlotByID});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create plot by admin
export const createPlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotNo, size, rate, length, breath,
            site, clientID, duration, hasSold,
            shouldPay, paid, agentID, plotStatus}:CreatePlotBodyTypes = req.body;

        const isPlottExist = await Plot.findOne({
            plotNo
        });

        if (isPlottExist) return next(new ErrorHandler("Plot no. is already in use", 409));

        const newPlot = await Plot.create({
            plotNo, size, rate, length, breath,
            site, clientID, duration, hasSold,
            shouldPay, paid, agentID, plotStatus
        });

        res.status(200).json({success:true, message:"Plot created", jsonData:newPlot});
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

