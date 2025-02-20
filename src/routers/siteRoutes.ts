import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createSite, findAllSites, findAllSitesName, findSingleSite, updateSite } from "../controllers/siteController";

const siteRouter = express.Router();

siteRouter.route("/all-sites").get(isUserAuthenticated, findAllSites)
siteRouter.route("/single-site").get(isUserAuthenticated, findSingleSite)
siteRouter.route("/sites-name").get(isUserAuthenticated, findAllSitesName)
siteRouter.route("/create").post(isUserAuthenticated, createSite)
siteRouter.route("/update").put(isUserAuthenticated, updateSite)

export default siteRouter;