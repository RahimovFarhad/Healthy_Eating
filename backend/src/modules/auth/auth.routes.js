import { Router } from "express";
import { checkLogin, register } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/login", checkLogin);
authRouter.post("/register", register);

export default authRouter;
