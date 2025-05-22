import { NextFunction, Request, Response } from "express";
import User, { CreateUserBodyTypes, LoginUserBodyTypes } from "../models/userModel";
import { ErrorHandler } from "../utils/utilClasses";
import { sendToken } from "../utils/utilFunctions";
import { cookieOptions } from "../utils/utilConstants";
import { AuthReqTypes } from "../middlewares/auth";
import Plot, { PlotTypes } from "../models/plotModel";
import Slip, { SlipTypes } from "../models/slipModel";
import Client, { ClientTypes } from "../models/clientModel";

// Get search suggession
export const getSearchedSuggesstions = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {searchQuery} = req.query;
        let allClientsOfSearialNo:ClientTypes[] = [];
        let allPlots:PlotTypes[] = [];
        let allSlips:SlipTypes[] = [];

        console.log({searchQuery, type:typeof searchQuery});
        

        if (!searchQuery) return next(new ErrorHandler("searchQuery not found", 404));

        const searchQueryNumber = Number(searchQuery);

        //const allSuggesstions = await User.find();
        const allClientsOfName = await Client.find({
            name:{
                $regex:searchQuery,
                $options:"i"
            },
            ownerShipStatus:{$ne:"cancelled"}
        }).select("name");
        const allClientsOfGuardianName = await Client.find({
            guardian:{
                $regex:searchQuery,
                $options:"i"
            }
        }).select("guardian");

        const allNefts = await Slip.find({
            modeOfPayment:"transfer",
            paymentID:{
                $regex:searchQuery,
                $options:"i"
            }
        }).select("paymentID");

        const allDrafts = await Slip.find({
            modeOfPayment:"cheque",
            paymentID:{
                $regex:searchQuery,
                $options:"i"
            }
        }).select("paymentID");

        if (!isNaN(searchQueryNumber)) {
            allClientsOfSearialNo = await Client.find({
                serialNumber:searchQueryNumber,
                ownerShipStatus:{$ne:"cancelled"}
            }).select("serialNumber");
            allPlots = await Plot.find({
                plotNo:searchQueryNumber
            }).select("plotNo");
            allSlips = await Slip.find({
                slipNo:searchQueryNumber
            }).select("slipNo");
        }

        res.status(200).json({success:true, message:"All users", jsonData:{
            allClientsOfName,
            allClientsOfGuardianName,
            allClientsOfSearialNo,
            allPlots,
            allSlips,
            allNefts,
            allDrafts
        }});
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
        });

        res.status(200).json({success:true, message:"All agents", jsonData:allAgents});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get all total sold area of each agents in each site (agents name and their sold area in each site)
export const agentsAndSoldArea = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const plotsGroupByAgent = await Plot.aggregate([
            {$group:{
                _id:{agentID:"$agentID", site:"$site"},
                soldArea:{$sum:"$size"},
                shouldPay:{$sum:"$shouldPay"},
                paid:{$sum:"$paid"},
                pending:{$sum:{$subtract:["$paid", "$shouldPay"]}}
            }},
            {$lookup:{
                from:"users",
                localField:"_id.agentID",
                foreignField:"_id",
                as:"agentInfo"
            }},
            {$unwind:"$agentInfo"},
            {$project:{
                agentName:"$agentInfo.name",
                site:"$_id.site",
                soldArea:1,
                shouldPay:1,
                paid:1,
                pending:1
            }}

        ]);

        res.status(200).json({success:true, message:"All agents and their sold area", jsonData:plotsGroupByAgent});
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
