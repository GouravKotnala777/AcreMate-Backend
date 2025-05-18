import mongoose, { Model, ObjectId } from "mongoose";
import { CoordinatesTypes } from "./plotModel";

export interface PlotBeltTypes {
    noOfPlots:number;
    lastPlotNo:number;
    baseSize:number;
};
export interface SiteTypes{
    _id:ObjectId;
    siteName:string;
    totalSize:number;
    soldArea:number;
};
export type CreateSiteBodyTypes = Pick<SiteTypes, "siteName"|"totalSize">;
export type UpdateSiteBodyTypes = Partial<Pick<SiteTypes, "totalSize"|"soldArea">>&{siteID:ObjectId;}&{noOfPlots?:number; lastPlotNo?:number; baseSize?:number;};

const siteSchema = new mongoose.Schema<SiteTypes>({
    siteName:{
        type:String,
        lowercase:true,
        required:true
    },
    totalSize:{
        type:Number,
        required:true
    },
    soldArea:{
        type:Number,
        default:0
    }
}, {timestamps:true});

const siteModel:Model<SiteTypes> = mongoose.models.Site || mongoose.model<SiteTypes>("Site", siteSchema);

export default siteModel;