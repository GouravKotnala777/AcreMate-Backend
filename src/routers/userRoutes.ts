import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { agentsAndSoldArea, findAllAgents, getSearchedSuggesstions, login, logout, myProfile, register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/search").get(isUserAuthenticated, getSearchedSuggesstions);
userRouter.route("/all-agents").get(isUserAuthenticated, findAllAgents);
userRouter.route("/sold-area").get(isUserAuthenticated, agentsAndSoldArea);
userRouter.route("/my-profile").get(isUserAuthenticated, myProfile);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;