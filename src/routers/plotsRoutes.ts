import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createPlot, deletePlot, findAllPlots, updatePlot } from "../controllers/plotController";

const plotRouter = express.Router();

plotRouter.route("/all-plots").get(isUserAuthenticated, findAllPlots);
plotRouter.route("/create").post(isUserAuthenticated, createPlot);
plotRouter.route("/update").put(isUserAuthenticated, updatePlot);
plotRouter.route("/delete").delete(isUserAuthenticated, deletePlot);

export default plotRouter;