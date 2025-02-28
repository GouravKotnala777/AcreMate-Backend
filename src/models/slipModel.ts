import mongoose, { Model, ObjectId } from "mongoose";

export interface SlipTypes{
    _id:ObjectId;
    slipType:"downpay"|"token"|"emi";
    slipNo:number;
    modeOfPayment:"cash"|"cheque"|"transfer";
    amount:number;
    clientID:ObjectId;
    plotID:ObjectId;
    agentID:ObjectId;
    isCancelled:boolean;
    cancelledFor:"bounced"|"cash not received"|"transaction failed";
    paymentID?:string;
    remark:string;
    createdAt:Date;
    updatedAt:Date;
};
export type CreateSlipBodyTypes = Pick<SlipTypes, "slipType"|"slipNo"|"modeOfPayment"|"paymentID"|"amount"|"clientID"|"plotID"|"agentID">;
export type UpdateSlipBodyTypes = Partial<Pick<SlipTypes, "slipType"|"isCancelled"|"cancelledFor"|"remark">>&{slipID:ObjectId};

const slipSchema = new mongoose.Schema<SlipTypes>({
    slipType:{
        type:String,
        enum:["downpay", "token", "emi"],
        default:"token"
    },
    slipNo:{
        type:Number,
        required:true,
        unique:true
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
    },
    isCancelled:{
        type:Boolean,
        default:false
    },
    cancelledFor:{
        type:String,
        enum:["bounced", "cash not received", "transaction failed"],
        default:null
    },
    paymentID:{
        type:String,
        default:null
    },
    remark:String
}, {timestamps:true});

const slipModel:Model<SlipTypes> = mongoose.models.Slip || mongoose.model<SlipTypes>("Slip", slipSchema);

export default slipModel;