import mongoose, { Model, ObjectId } from "mongoose";

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
    plotsInSingleRow:PlotBeltTypes[];
};
export type CreateSiteBodyTypes = Pick<SiteTypes, "siteName"|"totalSize">;
export type UpdateSiteBodyTypes = Partial<Pick<SiteTypes, "totalSize"|"soldArea">>&{siteID:ObjectId;}&{noOfPlots?:number; lastPlotNo?:number; baseSize?:number;};

const siteSchema = new mongoose.Schema<SiteTypes>({
    siteName:{
        type:String,
        lowercase:true,
        required:true
    },
    totalSize:Number,
    soldArea:{
        type:Number,
        default:0
    },
    plotsInSingleRow:[{
        noOfPlots:Number,
        lastPlotNo:Number,
        baseSize:Number
    }]
}, {timestamps:true});

const siteModel:Model<SiteTypes> = mongoose.models.Site || mongoose.model<SiteTypes>("Site", siteSchema);

export default siteModel;