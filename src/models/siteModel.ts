import mongoose, { Model, ObjectId } from "mongoose";

export interface SiteTypes{
    _id:ObjectId;
    siteName:string;
    totalSize:number;
};
export type CreateSiteBodyTypes = Pick<SiteTypes, "siteName"|"totalSize">;

const siteSchema = new mongoose.Schema<SiteTypes>({
    siteName:{
        type:String,
        lowercase:true,
        required:true
    },
    totalSize:Number
}, {timestamps:true});

const siteModel:Model<SiteTypes> = mongoose.models.Site || mongoose.model<SiteTypes>("Site", siteSchema);

export default siteModel;