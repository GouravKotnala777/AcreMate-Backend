import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { cancelClent, createClient, findAllClients } from "../controllers/clientController";

const clientRouter = express.Router();

clientRouter.route("/all-clients").get(isUserAuthenticated, findAllClients);
clientRouter.route("/create").post(isUserAuthenticated, createClient);
clientRouter.route("/cancel").delete(isUserAuthenticated, cancelClent);

export default clientRouter;