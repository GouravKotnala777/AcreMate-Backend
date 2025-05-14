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
        const {siteName} = req.query;

        if (!siteName) return next(new ErrorHandler("siteName not found", 404));

        const allPlots = await Plot.find({site:siteName}).select("plotNo size rate plotStatus hasSold shouldPay paid coordinates length breath");

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
        
        let findAllPayments = null;
        let findSelectedPlot = null;

        if (plotID && plotID !== "null" && plotID !== "undefined") {
            findSelectedPlot = await Plot.findById(plotID)
            .populate({model:"Client", path:"clientID", select:"name"})
            .populate({model:"User", path:"agentID", select:"name"});
            
            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));
    
            findAllPayments = await Slip.find({
                plotID,
                clientID:findSelectedPlot.clientID
            }).select("slipNo slipType amount modeOfPayment paymentID createdAt");
        }
        else if (clientID && clientID !== "null" && clientID !== "undefined") {
            findSelectedPlot = await Plot.findOne({
                clientID
            })
            .populate({model:"Client", path:"clientID", select:"name"})
            .populate({model:"User", path:"agentID", select:"name"});;            

            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));

            findAllPayments = await Slip.find({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).select("slipNo slipType amount modeOfPayment paymentID createdAt");
        }
        else if (slipID && slipID !== "null" && slipID !== "undefined") {
            const selectedSlip = await Slip.findById(slipID);
            if (!selectedSlip)return next(new ErrorHandler("Slip not found", 404));
            findSelectedPlot = await Plot.findById(selectedSlip.plotID)
            .populate({model:"Client", path:"clientID", select:"name"})
            .populate({model:"User", path:"agentID", select:"name"});;

            if (!findSelectedPlot)return next(new ErrorHandler("Plot not found", 404));

            findAllPayments = await Slip.find({
                plotID:findSelectedPlot._id,
                clientID:findSelectedPlot.clientID
            }).select("slipNo slipType amount modeOfPayment paymentID createdAt");
        }
        else{
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }
        
        res.status(200).json({success:true, message:"Single plot", jsonData:{singlePlot:findSelectedPlot, allSlips:findAllPayments}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get all pending client by admin
export const findPendingClients = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {skip} = req.query;
        const today = new Date();

        console.log({skip});
        

        const pendingPlots = await Plot.aggregate([
            {
                $addFields:{
                    timeCovered:{
                        $ceil:{
                            $divide:[
                                {$subtract:[today, "$createdAt"]},
                                1000 * 60 * 60 * 24 * 30
                            ]
                        }
                    },
                    pending:{
                        $subtract:["$paid", {$multiply:["$shouldPay", {
                                $ceil:{
                                    $divide:[
                                        {$subtract:[today, "$createdAt"]},
                                        1000 * 60 * 60 * 24 * 30
                                        ]
                                }
                            }
                        ]}]
                    }
                }
            },
            {
                $match:{
                    $expr:{$lt:["$pending", 0]},
                    plotStatus:"pending"
                }
            },
            {
                $lookup:{
                    from:"clients",
                    as:"clientDetailes",
                    localField:"clientID",
                    foreignField:"_id"
                }
            },
            {
                $unwind:"$clientDetailes"
            },
            {
                $project:{
                    "clientDetailes._id":1,
                    "clientDetailes.serialNumber":1,
                    "clientDetailes.name":1,
                    "clientDetailes.guardian":1,
                    "plotNo":1,
                    "site":1,
                    "clientDetailes.mobile":1,
                    "timeCovered":1,
                    "pending":1
                }
            },
            {$skip:Number(skip)},
            {$limit:1}
        ]);
        
        if (pendingPlots.length === 0) {
            res.status(200).json({success:true, message:"No more pendings", jsonData:[]});
            return;
        }

        const lastSlipIncluded = await Promise.all(
            pendingPlots.map(async(plt) => ({
                ...plt, lastSlip:await Slip.findOne({
                    plotID:plt._id,
                    clientID:plt.clientDetailes._id,
                    isCancelled:false
                }).sort({_id:1}).select("amount createdAt")
            }))
        );

        res.status(200).json({success:true, message:"Single client", jsonData:lastSlipIncluded});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create new plots by admin
export const createPlots = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotsCoordArr, plotNo, size, rate, length, breath,
            site, duration, quantity,
            x, y
        
        }:CreatePlotBodyTypes&CreateClientBodyTypes&CreateSlipBodyTypes&{plotsCoordArr:{baseSize:number; plotNo:number; x:number; y:number;}[]}&{x:number; y:number;} = req.body;


        // Check if any plot already exist
        const isPlotExist = await Plot.findOne({
            plotNo:{$in:Array.from({length:Number(quantity)}, (_, i) => Number(plotNo)+i)},
            site
        });

        if (isPlotExist) return next(new ErrorHandler("One or more plot numbers are already in use", 409));

        const newPlot = await Plot.create({
            plotNo:Number(plotNo), size, rate, 
            length, breath, site, duration, 
            hasSold:false, 
            plotStatus:"vacant", 
            //beltRange:[Number(plotNo), Number(plotNo)+Number(quantity)-1],
            coordinates:{x, y}
        });
        //for(let i=1; i<=plotsCoordArr.length; i++){
        //}

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
            slipType, slipNo, modeOfPayment, paymentID, amount,
            size, plotNo, length, breath
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
                {plotNo}
            ],
            site:findPlotByID.site, plotStatus:"vacant", hasSold:false
        });
        if (!vacantPlot) return next(new ErrorHandler("Vacant plot (for area adjustment) not found", 404));

        if (vacantPlot.size < Number(size) - findPlotByID.size) return next(new ErrorHandler(`Vacant plot not have enough area`, 409));

        // adjust extra area from vacant plot
        if (findPlotByID.size < Number(size)) {
            if (findPlotByID.plotNo !== vacantPlot.plotNo) {
                vacantPlot.size = vacantPlot.size - (size - findPlotByID.size);
                if (findPlotByID.length < length) {
                    vacantPlot.length = vacantPlot.length - (length - findPlotByID.length);
                }
                else if (findPlotByID.breath < breath) {
                    vacantPlot.breath = vacantPlot.breath - (breath - findPlotByID.breath);
                    for(let pltNo=findPlotByID.plotNo+1; pltNo<=plotNo; pltNo++){
                        await Plot.findOneAndUpdate({plotNo:pltNo, site:findPlotByID.site}, {$inc:{"coordinates.x":(Number(breath) - Number(findPlotByID.breath))*3}})
                    }
                }
                else{
                    console.log("na to length badhani hai na hi breath from upper part");
                }
                await vacantPlot.save();
                console.log({realSize:findPlotByID.size, soldSize:size, realType:typeof size, updatedType:Number(size)});
                console.log(`${findPlotByID.plotNo} ke liye ${vacantPlot.plotNo} se ${(size - findPlotByID.size)} le liya`);
            }
            else{
                console.log("adjust kisi or plot se hona chahiye");
                return next(new ErrorHandler("adjust kisi or plot se hona chahiye", 400));
            }
        }
        else if (findPlotByID.size === Number(size)) {
            console.log("kush nahi hoga");
        }
        else{
            if (findPlotByID.plotNo !== vacantPlot.plotNo) {
                vacantPlot.size = vacantPlot.size + (findPlotByID.size - Number(size));
                if (findPlotByID.length > length) {
                    vacantPlot.length = vacantPlot.length + (findPlotByID.length - length);
                }
                else if (findPlotByID.breath > breath) {
                    vacantPlot.breath = vacantPlot.breath + (findPlotByID.breath - breath);
                    for(let pltNo=findPlotByID.plotNo+1; pltNo<=plotNo; pltNo++){
                        await Plot.findOneAndUpdate({plotNo:pltNo, site:findPlotByID.site}, {$inc:{"coordinates.x":(Number(breath) - Number(findPlotByID.breath))*3}})
                    }
                }
                else{
                    console.log("na to length ghatani hai na hi breath from lower part");
                }
                await vacantPlot.save();
                console.log({realSize:findPlotByID.size, soldSize:size, realType:typeof size, updatedType:Number(size)});
                console.log(`${findPlotByID.plotNo} ko kam kar diya aur ${vacantPlot.plotNo} me ${(findPlotByID.size - size)} add kar diye`);
            }
            else{
                console.log("adjust kisi or plot se hona chahiye");
                return next(new ErrorHandler("adjust kisi or plot se hona chahiye", 400));
            }
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
        findPlotByID.hasSold = true;
        findPlotByID.length = Number(length);
        findPlotByID.breath = Number(breath);
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

        const updateSite = await Site.findOneAndUpdate({siteName:updatePlot.site}, {$inc:{soldArea:size}});
        
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


        const findClientByID = await Client.findById(findPlotByID.clientID);

        if (!findClientByID)  return next(new ErrorHandler("Client not found", 404));

        findPlotByID.clientID = null;
        findPlotByID.agentID = null;
        findPlotByID.shouldPay = 0;
        findPlotByID.paid = 0;
        findPlotByID.plotStatus = "vacant";

        findClientByID.ownerShipStatus = "cancelled";

        const updatePlot = await findPlotByID.save();
        const updatedClient = await findClientByID.save();

        const findSiteByName = await Site.findOneAndUpdate({
            siteName:findPlotByID.site
        }, {$inc:{soldArea:-(findPlotByID.size)}}, {new:true});


        res.status(200).json({success:true, message:"Plot created and assigned", jsonData:updatePlot});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Update plot coordinates by admin
export const updatePlotCoordinates = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {plotID, x, y}:{plotID:string; x:number; y:number;} = req.body;

        const findPlotByIDAndUpdate = await Plot.findByIdAndUpdate(plotID, {
            coordinates:{x, y}
        }, {new:true});

        if (!findPlotByIDAndUpdate) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"Plot updated", jsonData:findPlotByIDAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Delete plot by admin
//export const deletePlot = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {plotID}:{plotID:ObjectId} = req.body;

//        const findPlotByIDAndDelete = await Plot.findByIdAndDelete(plotID);

//        if (!findPlotByIDAndDelete) return next(new ErrorHandler("Plot not exist", 404));

//        res.status(200).json({success:true, message:"Plot deleted", jsonData:findPlotByIDAndDelete});
//    } catch (error) {
//        console.log(error);
//        next(error);
//    }
//};

