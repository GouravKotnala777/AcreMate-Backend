import { NextFunction, Request, Response } from "express";
import User, { CreateUserBodyTypes, LoginUserBodyTypes } from "../models/userModel";
import { ErrorHandler } from "../utils/utilClasses";
import { sendToken } from "../utils/utilFunctions";
import { cookieOptions } from "../utils/utilConstants";
import { AuthReqTypes } from "../middlewares/auth";

// Get all users by admin
export const findAllUsers = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allUsers = await User.find();

        res.status(200).json({success:true, message:"All users", jsonData:allUsers});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get all agents by admin (_id and name only)
export const findAllAgents = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allAgents = await User.find({
            role:"agent"
        }).select("_id name");

        res.status(200).json({success:true, message:"All agents", jsonData:allAgents});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get single user by admin
export const findSingleUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {userID} = req.query;

        if (!userID)return next(new ErrorHandler("userID not found", 404));

        const findUserByID = await User.findById(userID);

        res.status(200).json({success:true, message:"Single user", jsonData:findUserByID});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Logged in user profile
export const myProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        res.status(200).json({success:true, message:"Logged in user", jsonData:(req as AuthReqTypes).user});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// User register
export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {firstName, lastName, email, password, gender, mobile}:CreateUserBodyTypes = req.body;

        console.log({firstName, lastName, email, password, gender, mobile});
        
        if (!firstName || !lastName || !email || !password || !gender || !mobile) return next(new ErrorHandler("All fields are required", 400));

        const isUserExist = await User.findOne({email});

        if (isUserExist) return next(new ErrorHandler("User already exist", 401));

        const newUser = await User.create({
            name:firstName+lastName, email, password, gender, mobile
        });

        res.status(200).json({success:true, message:"User created", jsonData:newUser});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// User login
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:LoginUserBodyTypes = req.body;


        if (!email || !password) return next(new ErrorHandler("All fields are required", 400));


        console.log({email, password});
        

        const isUserExist = await User.findOne({email});
        
        if (!isUserExist) return next(new ErrorHandler("Wrong email or password", 401));

        const isPasswordMatched = await isUserExist.comparePassword(password);        

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password", 401));

        await sendToken(isUserExist._id, res, next);

        res.status(200).json({success:true, message:"User created", jsonData:isUserExist});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// User logout
export const logout = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        res.status(200).cookie("userToken", "", {...cookieOptions, expires:new Date(0)}).json({success:true, message:"User logout", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
