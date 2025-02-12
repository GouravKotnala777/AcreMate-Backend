import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createSlip, findAllSlips, updateSlip } from "../controllers/slipController";

const slipRouter = express.Router();

slipRouter.route("/all-slips").get(isUserAuthenticated, findAllSlips);
slipRouter.route("/create").post(isUserAuthenticated, createSlip);
slipRouter.route("/update").put(isUserAuthenticated, updateSlip);

export default slipRouter;