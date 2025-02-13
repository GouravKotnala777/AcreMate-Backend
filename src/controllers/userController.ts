import { NextFunction, Request, Response } from "express";
import User, { CreateUserBodyTypes, LoginUserBodyTypes } from "../models/userModel";
import { ErrorHandler } from "../utils/utilClasses";
import { sendToken } from "../utils/utilFunctions";
import { cookieOptions } from "../utils/utilConstants";

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

// User register
export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, gender, mobile, role}:CreateUserBodyTypes = req.body;

        const isUserExist = await User.findOne({email});

        if (isUserExist) return next(new ErrorHandler("User already exist", 401));

        const newUser = await User.create({
            name, email, password, gender, mobile, role 
        });

        res.status(200).json({success:true, message:"User created", jsonData:newUser});
    } catch (error) {
        console.log(error);
    }
};

// User login
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:LoginUserBodyTypes = req.body;

        const isUserExist = await User.findOne({email});

        if (!isUserExist) return next(new ErrorHandler("Wrong email or password", 401));

        //const existedUser = await User.create({
        //    email, password
        //});

        const isPasswordMatched = await isUserExist.comparePassword(password as string);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password", 401));

        await sendToken(isUserExist._id, res, next);

        res.status(200).json({success:true, message:"User created", jsonData:isUserExist});
    } catch (error) {
        console.log(error);
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
