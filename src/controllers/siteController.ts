import { NextFunction, Request, Response } from "express";
import Site, { CreateSiteBodyTypes, SiteTypes, UpdateSiteBodyTypes } from "../models/siteModel";
import { ErrorHandler } from "../utils/utilClasses";


// Get all Sites by admin
export const findAllSites = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allSites = await Site.find();

        res.status(200).json({success:true, message:"All sites", jsonData:allSites});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get all sites name array by admin (site name array only)
export const findAllSitesName = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allSiteNames = await Site.find().distinct("siteName");

        res.status(200).json({success:true, message:"All sites name", jsonData:allSiteNames});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get single site by admin
export const findSingleSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {siteID} = req.query;

        if (!siteID)return next(new ErrorHandler("siteID not found", 404));

        const findSiteByID = await Site.findById(siteID);

        res.status(200).json({success:true, message:"Single site", jsonData:findSiteByID});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Create site by admin
export const createSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {siteName, totalSize}:CreateSiteBodyTypes = req.body;

        const isSiteExist = await Site.findOne({
            siteName
        });
        
        if (isSiteExist) return next(new ErrorHandler("Site already exist", 409));

        const createSite = await Site.create({
            siteName, totalSize
        });

        res.status(200).json({success:true, message:"Site created", jsonData:createSite});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Update site by admin
export const updateSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {siteID, totalSize, soldArea}:UpdateSiteBodyTypes = req.body;

        const findSiteByIDAndUpdate = await Site.findByIdAndUpdate(siteID, {
            ...(totalSize&&{totalSize}),
            ...(soldArea&&{soldArea})
        }, {new:true});
        
        if (!findSiteByIDAndUpdate) return next(new ErrorHandler("Internal server error", 500));        

        res.status(200).json({success:true, message:"Site updated", jsonData:findSiteByIDAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
