import mongoose, { Model, ObjectId } from "mongoose";
import bcryptJS from "bcryptjs";
import jsonWebToken from "jsonwebtoken";

export interface UserTypes{
    _id:ObjectId;
    name:string;
    email:string;
    password?:string;
    gender:"male"|"female"|"other";
    mobile:string;
    role:"agent"|"admin";
    createdAt:Date;
    updatedAt:Date;

    comparePassword:(password:string) => Promise<boolean>;
};
export type CreateUserBodyTypes = Pick<UserTypes, "name"|"email"|"password"|"gender"|"mobile"|"role">;
export type LoginUserBodyTypes = Pick<UserTypes, "email"|"password">;

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

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();

    this.password = await bcryptJS.hash(this.password as string, 6);
    next();
});

userSchema.methods.comparePassword = async function(password:string){
    const isPasswordMatched = await bcryptJS.compare(password, this.password);
    return isPasswordMatched;
};

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;