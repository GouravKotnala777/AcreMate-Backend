import express from "express";
import userRouter from "./routers/userRoutes.js";
import clientRouter from "./routers/clientRoutes.js";
import plotRouter from "./routers/plotsRoutes.js";
import slipRouter from "./routers/slipRoutes.js";
import siteRouter from "./routers/siteRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {config} from "dotenv";

config({path:"./.env"});


const app = express();

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [];

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:allowedOrigins,
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true
}));


app.use("/api/v1/user", userRouter);
app.use("/api/v1/client", clientRouter);
app.use("/api/v1/plot", plotRouter);
app.use("/api/v1/slip", slipRouter);
app.use("/api/v1/site", siteRouter);

export default app;