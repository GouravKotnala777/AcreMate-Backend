import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { agentAndSite, agentsAndSoldArea, findAllAgents, findAllUsers, findSingleUser, getSearchedSuggesstions, login, logout, myProfile, register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/all-users").get(isUserAuthenticated, findAllUsers);
userRouter.route("/search").get(isUserAuthenticated, getSearchedSuggesstions);
userRouter.route("/all-agents").get(isUserAuthenticated, findAllAgents);
userRouter.route("/sold-area").get(isUserAuthenticated, agentsAndSoldArea);
userRouter.route("/sold-area2").get(isUserAuthenticated, agentAndSite);
userRouter.route("/single-user").get(isUserAuthenticated, findSingleUser);
userRouter.route("/my-profile").get(isUserAuthenticated, myProfile);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;