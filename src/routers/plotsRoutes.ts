import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { assignPlotToClient, createPlots, deletePlot, detachClientFromPlot, findAllPlots, findPendingClients, findSinglePlot, updatePlot } from "../controllers/plotController";

const plotRouter = express.Router();

plotRouter.route("/all-plots").get(isUserAuthenticated, findAllPlots);
plotRouter.route("/pendings").get(isUserAuthenticated, findPendingClients);
plotRouter.route("/single-plot").get(isUserAuthenticated, findSinglePlot);
plotRouter.route("/create-plots").post(isUserAuthenticated, createPlots);
plotRouter.route("/assign").post(isUserAuthenticated, assignPlotToClient);
plotRouter.route("/reset").post(isUserAuthenticated, detachClientFromPlot);
plotRouter.route("/update").put(isUserAuthenticated, updatePlot);
plotRouter.route("/delete").delete(isUserAuthenticated, deletePlot);

export default plotRouter;