import { NextFunction, Request, Response } from "express";
import Plot, { CreatePlotBodyTypes, PlotTypes, UpdatePlotBodyTypes } from "../models/plotModel";
import { ErrorHandler } from "../utils/utilClasses";
import { ObjectId } from "mongoose";
import Slip, { CreateSlipBodyTypes, SlipTypes } from "../models/slipModel";
import Client, { CreateClientBodyTypes } from "../models/clientModel";
import Site from "../models/siteModel";

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
        const {clientID, plotID, slipID, siteID, agentID} = req.query;

        if (!clientID && !plotID && !slipID && !siteID && !agentID)return next(new ErrorHandler("singleItemID not found", 404));
        
        let findFirstPayment = null;
        let findLastPayment = null;
        let findAllPayments = null;
        let findSelectedPlot = null;

        if (plotID && plotID !== "null" && plotID !== "undefined") {
            findSelectedPlot = await Plot.findById(plotID);
            
            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));
    
            findFirstPayment = await Slip.findOne({
                plotID,
                clientID:findSelectedPlot.clientID
            }).sort({_id:1});
            findLastPayment = await Slip.findOne({
                plotID,
                clientID:findSelectedPlot.clientID
            }).sort({_id:-1});
            findAllPayments = await Slip.find({
                plotID,
                clientID:findSelectedPlot.clientID
            });
        }
        else if (clientID && clientID !== "null" && clientID !== "undefined") {
            findSelectedPlot = await Plot.findOne({
                clientID
            });            

            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));

            findFirstPayment = await Slip.findOne({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).sort({_id:1});
            findLastPayment = await Slip.findOne({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).sort({_id:-1});
            findAllPayments = await Slip.find({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            });
        }
        else if (slipID && slipID !== "null" && slipID !== "undefined") {
            const selectedSlip = await Slip.findById(slipID);
            if (!selectedSlip)return next(new ErrorHandler("Slip not found", 404));
            findSelectedPlot = await Plot.findById(selectedSlip.plotID);

            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));

            findFirstPayment = await Slip.findOne({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).sort({_id:1});
            findLastPayment = await Slip.findOne({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).sort({_id:-1});
            findAllPayments = await Slip.find({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            });
        }
        else{
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }
        
        res.status(200).json({success:true, message:"Single plot", jsonData:{singlePlot:findSelectedPlot, firstSlip:findFirstPayment, lastSlip:findLastPayment, allSlips:findAllPayments}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create new plots by admin
export const createPlots = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotNo, size, rate, length, breath,
            site, duration, quantity
        
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes = req.body;


        // Check if any plot already exist
        const isPlotExist = await Plot.findOne({
            plotNo:{$in:Array.from({length:Number(quantity)}, (_, i) => Number(plotNo)+i)},
            site
        });

        if (isPlotExist) return next(new ErrorHandler("One or more plot numbers are already in use", 409));

        // Create an array of plot objects
        //const plotData = Array.from({length:quantity}, (_, i) => ({
        //    plotNo:Number(plotNo)+i, size, rate, length, breath,
        //    site, duration, hasSold:false,
        //    plotStatus:"vacant"
        //}))

        // Create plot in and then push in array
        const newPlots:PlotTypes[] = [];
        for(let i=0; i<Number(quantity); i++){
            const newPlot = await Plot.create({
                plotNo:Number(plotNo)+i, size, rate, 
                length, breath, site, duration, 
                hasSold:false, plotStatus:"vacant", beltRange:[Number(plotNo), Number(plotNo)+Number(quantity)-1]
            });

            newPlots.push(newPlot);
        }
        
        if (newPlots.length === 0) return next(new ErrorHandler("Internal server error for newPlot", 500));
        
        const findSiteByName = await Site.findOneAndUpdate({
            siteName:site
        }, {$inc:{soldArea:Number(size)*Number(quantity)}}, {new:true});

        res.status(200).json({success:true, message:"Plot created and assigned", jsonData:newPlots});
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
            slipType, slipNo, modeOfPayment, paymentID, amount,
            size, plotNo
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes = req.body;

        const isClientExist = await Client.findOne({
            serialNumber
        });
        
        if (isClientExist) return next(new ErrorHandler("Serial no. is already in use", 409));
              
        const findPlotByID = await Plot.findById(plotID);

        if (!findPlotByID) return next(new ErrorHandler("Internal server error for newPlot", 500));

        // find vacant plot for adjust area
        const vacantPlot = await Plot.findOne({
            $and:[
                {plotNo},
                {plotNo:{
                    $gte:findPlotByID.beltRange[0],
                    $lte:findPlotByID.beltRange[1]
                }}
            ],
            site:findPlotByID.site, plotStatus:"vacant", hasSold:false
        });
        if (!vacantPlot) return next(new ErrorHandler("Vacant plot (for area adjustment) not found", 404));

        if (vacantPlot.size < Number(size) - findPlotByID.size) return next(new ErrorHandler(`Vacant plot not have enough area`, 409));

        // adjust extra area from vacant plot
        if (findPlotByID.size < Number(size)) {
            console.log({realSize:findPlotByID.size, soldSize:size, realType:typeof size, updatedType:Number(size)});
            console.log(`${findPlotByID.plotNo} ke liye ${vacantPlot.plotNo} se ${(size - findPlotByID.size)} le liya`);
            
            vacantPlot.size = vacantPlot.size - (size - findPlotByID.size);
            await vacantPlot.save();
        }
        else if (findPlotByID.size === Number(size)) {
            console.log("kush nahi hoga");
        }
        else{
            console.log({realSize:findPlotByID.size, soldSize:size, realType:typeof size, updatedType:Number(size)});
            console.log(`${findPlotByID.plotNo} ko kam kar diya aur ${vacantPlot.plotNo} me ${(findPlotByID.size - size)} add kar diye`);
            vacantPlot.size = vacantPlot.size + (findPlotByID.size - Number(size));
            await vacantPlot.save();
        }


        const newClient = await Client.create({
            serialNumber, name, guardian, email, gender, mobile
        });
        
        if (!newClient) return next(new ErrorHandler("Internal server error for newClient", 500));


        
        const plotTotalValue = Number(size)*findPlotByID.rate;
        const emi = Math.ceil(plotTotalValue/findPlotByID.duration);

        findPlotByID.clientID = newClient._id;
        findPlotByID.agentID = agentID;
        findPlotByID.shouldPay = Number(emi);
        findPlotByID.paid = Number(amount);
        findPlotByID.size = Number(size);
        if (findPlotByID.paid < (Number(size)*findPlotByID.rate)) {
            findPlotByID.plotStatus = "pending";
        }
        else{
            findPlotByID.plotStatus = "completed";
        }

        const updatePlot = await findPlotByID.save();

        const newSlip = await Slip.create({
            slipType, slipNo, modeOfPayment, paymentID, amount, agentID, clientID:newClient._id, plotID:updatePlot._id
        });
        
        if (!newSlip) return next(new ErrorHandler("Internal server error for newSlip", 500));
        
        res.status(200).json({success:true, message:"Plot created and assigned", jsonData:updatePlot});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Unassign existing plot from client by admin
export const detachClientFromPlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            plotID
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes = req.body;

        //const isClientExist = await Client.findOne({
        //    serialNumber
        //});
        
        //if (isClientExist) return next(new ErrorHandler("Serial no. is already in use", 409));
        
        //const newClient = await Client.create({
        //    serialNumber, name, guardian, email, gender, mobile
        //});
        
        //if (!newClient) return next(new ErrorHandler("Internal server error for newClient", 500));
                
        const findPlotByID = await Plot.findById(plotID);

        if (!findPlotByID) return next(new ErrorHandler("Internal server error for newPlot", 500));
        
        const plotTotalValue = findPlotByID.size*findPlotByID.rate;
        const emi = Math.ceil(plotTotalValue/findPlotByID.duration);

        findPlotByID.clientID = null;
        findPlotByID.agentID = null;
        findPlotByID.shouldPay = 0;
        findPlotByID.paid = 0;
        findPlotByID.plotStatus = "vacant";

        const updatePlot = await findPlotByID.save();

        const findSiteByName = await Site.findOneAndUpdate({
            siteName:findPlotByID.site
        }, {$inc:{soldArea:-(findPlotByID.size)}}, {new:true});

        //const newSlip = await Slip.create({
        //    slipType, slipNo, modeOfPayment, paymentID, amount, agentID, clientID:newClient._id, plotID:updatePlot._id
        //});
        
        //if (!newSlip) return next(new ErrorHandler("Internal server error for newSlip", 500));
        
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

