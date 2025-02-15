import mongoose, { Model, ObjectId } from "mongoose";
import bcryptJS from "bcryptjs";

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
export type CreateUserBodyTypes = Pick<UserTypes, "email"|"password"|"gender"|"mobile"|"role">&{firstName:string; lastName:string};
export type LoginUserBodyTypes = Pick<UserTypes, "email"|"password">;

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        required:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
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
        default:"agent"
    }
}, {timestamps:true});

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();

    const hashedPassword = bcryptJS.hash(this.password as string, 7);
    this.password = await hashedPassword;
    next();
});

userSchema.methods.comparePassword = async function(password:string){
    console.log({s:password, hash:this.password});
    
    const isPasswordMatched = await bcryptJS.compare(password, this.password);
    console.log({isPasswordMatched});
    
    return isPasswordMatched;
};

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;