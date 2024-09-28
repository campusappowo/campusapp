import express from "express";
import jwt from "jsonwebtoken"
import { userRouter } from "./UserRouter";

export const lmsapiRouter = express.Router();

lmsapiRouter.use("/user", userRouter);