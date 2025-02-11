import mongoose, { Model, ObjectId } from "mongoose";

export interface SlipTypes{
    _id:ObjectId;
    slipNo:number;
    modeOfPayment:"cash"|"cheque"|"transfer";
    amount:number;
    clientID:ObjectId;
    plotID:ObjectId;
    agentID:ObjectId;
    createdAt:Date;
    updatedAt:Date;
};

const slipSchema = new mongoose.Schema<SlipTypes>({
    slipNo:{
        type:Number,
        required:true
    },
    modeOfPayment:{
        type:String,
        enum:["cash", "cheque", "transfer"],
        default:"cash"
    },
    amount:{
        type:Number,
        required:true
    },
    clientID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        required:true
    },
    plotID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Plot",
        required:true
    },
    agentID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
}, {timestamps:true});

const slipModel:Model<SlipTypes> = mongoose.models.Slip || mongoose.model<SlipTypes>("Slip", slipSchema);

export default slipModel;