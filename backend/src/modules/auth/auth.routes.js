import { Router } from "express";
import { login, register, verifyRegistration, resendVerificationCode, refreshToken, logoutController } from "./auth.controller.js";

/**
 * Express router for authentication endpoints
 * @type {Router}
 */
const authRouter = Router();

/**
 * POST /auth/login - Authenticate user and receive access token
 */
authRouter.post("/login", login);

/**
 * POST /auth/register - Register new user as Pending Registration and send verification code
 */
authRouter.post("/register", register);

/**
 * POST /auth/register/verify - Verify registration code and complete signup
 */
authRouter.post("/register/verify", verifyRegistration);

/**
 * POST /auth/register/resend - Resend verification code to email
 */
authRouter.post("/register/resend", resendVerificationCode);

/**
 * GET /auth/refresh - Refresh access token using refresh token cookie
 */
authRouter.get("/refresh", refreshToken);

/**
 * POST /auth/logout - Logout user and revoke refresh token
 */
authRouter.post("/logout", logoutController);

export default authRouter;
