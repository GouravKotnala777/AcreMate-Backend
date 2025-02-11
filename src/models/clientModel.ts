import mongoose, { Model, ObjectId } from "mongoose";

export interface ClientTypes{
    _id:ObjectId;
    serialNumber:number;
    name:string;
    guardian:string;
    email:string;
    mobile:string;
    gender:"male"|"female"|"other";
    createdAt:Date;
    updatedAt:Date;
};

const clientSchema = new mongoose.Schema<ClientTypes>({
    serialNumber:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:["male", "female", "other"],
        default:"male"
    },
    mobile:{
        type:String,
        required:true
    },
    guardian:{
        type:String,
        required:true
    }
}, {timestamps:true});

const clientModel:Model<ClientTypes> = mongoose.models.Client || mongoose.model<ClientTypes>("Client", clientSchema);

export default clientModel;