import { Router } from "express";
import { login, register, verifyRegistration, resendVerificationCode, refreshToken, logoutController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/register/verify", verifyRegistration);
authRouter.post("/register/resend", resendVerificationCode);
authRouter.get("/refresh", refreshToken);
authRouter.post("/logout", logoutController);

export default authRouter;
