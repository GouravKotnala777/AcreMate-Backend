import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { assignPlotToClient, createPlotAndAssign, deletePlot, detachClientFromPlot, findAllPlots, findSinglePlot, updatePlot } from "../controllers/plotController";

const plotRouter = express.Router();

plotRouter.route("/all-plots").get(isUserAuthenticated, findAllPlots);
plotRouter.route("/single-plot").get(isUserAuthenticated, findSinglePlot);
plotRouter.route("/create").post(isUserAuthenticated, createPlotAndAssign);
plotRouter.route("/assign").post(isUserAuthenticated, assignPlotToClient);
plotRouter.route("/reset").post(isUserAuthenticated, detachClientFromPlot);
plotRouter.route("/update").put(isUserAuthenticated, updatePlot);
plotRouter.route("/delete").delete(isUserAuthenticated, deletePlot);

export default plotRouter;