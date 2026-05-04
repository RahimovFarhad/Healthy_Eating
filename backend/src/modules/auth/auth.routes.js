import { Router } from "express";
import { login, register, refreshToken, logoutController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/refresh", refreshToken);
authRouter.post("/logout", logoutController);

export default authRouter;
