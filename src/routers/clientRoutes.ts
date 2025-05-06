import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createClient, sendMessageToClient } from "../controllers/clientController";

const clientRouter = express.Router();

clientRouter.route("/create").post(isUserAuthenticated, createClient);
clientRouter.route("/send-message").post(isUserAuthenticated, sendMessageToClient);

export default clientRouter;