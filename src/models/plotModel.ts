import mongoose, { Model, ObjectId } from "mongoose";

export interface CoordinatesTypes{
    x:number;
    y:number;
};
export interface PlotTypes{
    _id:ObjectId;
    plotNo:number;
    size:number;
    rate:number;
    length:number;
    breath:number;
    site:string;
    clientID:ObjectId|null;
    duration:number;
    hasSold:boolean;
    shouldPay:number;
    paid:number;
    agentID:ObjectId|null;
    plotStatus:"pending"|"completed"|"registered"|"vacant";
    createdAt:Date;
    updatedAt:Date;
    coordinates:CoordinatesTypes;
};

export type CreatePlotBodyTypes = Pick<PlotTypes, "plotNo"|"size"|"rate"|"site"|"duration"|"length"|"breath">&Partial<Pick<PlotTypes, "plotStatus"|"clientID"|"hasSold"|"agentID"|"paid"|"shouldPay"|"updatedAt"|"createdAt">>&{quantity:number};
export type UpdatePlotBodyTypes = Partial<Pick<PlotTypes, "plotNo"|"size"|"rate"|"clientID"|"duration"|"length"|"breath"|"hasSold"|"shouldPay"|"paid"|"agentID"|"plotStatus">>&{plotID:string;};



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
    length:Number,
    breath:Number,
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
        required:true,
        default:42
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
        enum:["pending", "completed", "registered", "vacant"],
        default:"vacant"
    },
    coordinates:{
        x:Number,
        y:Number
    }
}, {timestamps:true});

const plotModel:Model<PlotTypes> = mongoose.models.Plot || mongoose.model<PlotTypes>("Plot", plotSchema);

export default plotModel;