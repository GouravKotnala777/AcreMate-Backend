import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { findAllUsers, login, logout, register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/all-users").get(isUserAuthenticated, findAllUsers);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;