import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createSite, findAllSites, updateSite } from "../controllers/siteController";

const siteRouter = express.Router();

siteRouter.route("/all-sites").get(isUserAuthenticated, findAllSites)
siteRouter.route("/create").post(isUserAuthenticated, createSite)
siteRouter.route("/update").put(isUserAuthenticated, updateSite)

export default siteRouter;