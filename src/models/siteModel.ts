import mongoose, { Model, ObjectId } from "mongoose";

export interface SiteTypes{
    _id:ObjectId;
    siteName:string;
    totalSize:number;
};

const siteSchema = new mongoose.Schema<SiteTypes>({
    siteName:String,
    totalSize:Number
}, {timestamps:true});

const siteModel:Model<SiteTypes> = mongoose.models.Site || mongoose.model<SiteTypes>("Site", siteSchema);

export default siteModel;