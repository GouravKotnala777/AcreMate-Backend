import express, { urlencoded } from "express";
import userRouter from "./routers/userRoutes";
import clientRouter from "./routers/clientRoutes";
import plotRouter from "./routers/plotsRoutes";
import slipRouter from "./routers/slipRoutes";
import siteRouter from "./routers/siteRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
import {config} from "dotenv";

config({path:"./.env"});


const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:[process.env.CLIENT_URL as string],
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true
}))

app.use("/user", userRouter);
app.use("/client", clientRouter);
app.use("/plot", plotRouter);
app.use("/slip", slipRouter);
app.use("/site", siteRouter);

export default app;