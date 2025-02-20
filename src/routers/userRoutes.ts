import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { agentsAndSoldArea, findAllAgents, findAllUsers, findSingleUser, login, logout, myProfile, register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/all-users").get(isUserAuthenticated, findAllUsers);
userRouter.route("/all-agents").get(isUserAuthenticated, findAllAgents);
userRouter.route("/sold-area").get(isUserAuthenticated, agentsAndSoldArea);
userRouter.route("/single-user").get(isUserAuthenticated, findSingleUser);
userRouter.route("/my-profile").get(isUserAuthenticated, myProfile);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;