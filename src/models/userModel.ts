import mongoose, { Model, ObjectId } from "mongoose";

export interface UserTypes{
    _id:ObjectId;
    name:string;
    email:string;
    mobile:string;
    password:string;
    gender:"male"|"female"|"other";
    role:"agent"|"admin";
    createdAt:Date;
    updatedAt:Date;
};

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
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
    role:{
        type:String,
        enum:["agent", "admin"],
        required:true
    }
}, {timestamps:true});

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;