import mongoose, { Model, ObjectId } from "mongoose";

export interface PlotTypes{
    _id:ObjectId;
    plotNo:number;
    size:number;
    rate:number;
    dimention:{
        length:number;
        width:number;
    };
    site:string;
    clientID:ObjectId|null;
    duration:number;
    hasSold:boolean;
    shouldPay:number;
    paid:number;
    agentID:ObjectId|null;
    plotStatus:"pending"|"completed"|"registered"|"cencelled";
    createdAt:Date;
    updatedAt:Date;
};

export type CreatePlotBodyTypes = Pick<PlotTypes, "plotNo"|"size"|"rate"|"dimention"|"site"|"clientID"|"duration"|"hasSold"|"shouldPay"|"paid"|"agentID"|"plotStatus">;
export type UpdatePlotBodyTypes = Pick<PlotTypes, "plotNo"|"size"|"rate"|"dimention"|"clientID"|"duration"|"hasSold"|"shouldPay"|"paid"|"agentID"|"plotStatus">&{plotID:ObjectId;};



const plotSchema = new mongoose.Schema<PlotTypes>({
    plotNo:{
        type:Number,
        required:true
    },
    size:{
        type:Number,
        required:true
    },
    rate:{
        type:Number,
        required:true
    },
    dimention:{
        length:Number,
        width:Number
    },
    site:{
        type:String,
        required:true
    },
    clientID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        default:null
    },
    duration:{
        type:Number,
        required:true
    },
    hasSold:{
        type:Boolean,
        default:false
    },
    shouldPay:{
        type:Number,
        default:0
    },
    paid:{
        type:Number,
        default:0
    },
    agentID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    plotStatus:{
        type:String,
        enum:["pending", "completed", "registered", "cencelled"],
        default:"pending"
    }
}, {timestamps:true});

const plotModel:Model<PlotTypes> = mongoose.models.Plot || mongoose.model<PlotTypes>("Plot", plotSchema);

export default plotModel;