import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { cancelClent, createClient, findAllClients, findSingleClient } from "../controllers/clientController";

const clientRouter = express.Router();

clientRouter.route("/all-clients").get(isUserAuthenticated, findAllClients);
clientRouter.route("/single-client").get(isUserAuthenticated, findSingleClient);
clientRouter.route("/create").post(isUserAuthenticated, createClient);
clientRouter.route("/cancel").delete(isUserAuthenticated, cancelClent);

export default clientRouter;