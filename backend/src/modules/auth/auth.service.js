/**
 * Authentication service module
 * Handles user authentication, registration, and token management
 * @module auth/service
 */

import { prisma } from "../../db/prisma.js";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../../utils/hash.js";
import { ensureDefaultGoalsForUser } from "../goals/goals.service.js";
import { randomInt, randomUUID } from "node:crypto";
import { sendVerificationEmail } from "../../utils/email.js";

const { sign, verify } = jwt;

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase
 * @param {string} email - The email address to normalize
 * @returns {string} The normalized email address
 */
function normalizeEmail(email) {
    return email?.trim().toLowerCase();
}

/**
 * Normalizes a username by trimming whitespace and converting to lowercase
 * @param {string} username - The username to normalize
 * @returns {string} The normalized username
 */
function normalizeUsername(username) {
    return username?.trim().toLowerCase();
}

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

/**
 * Custom error class for user not found errors
 */
export class UserNotFoundError extends AuthError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

/**
 * Authenticates a user with email and password, and returns a JWT access token
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<string>} JWT access token valid for 1 hour
 * @throws {UserNotFoundError} If no user exists with the provided email
 * @throws {AuthError} If the password is invalid
 */
async function authenticateUser(email, password) {
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (!user) {
        throw new UserNotFoundError();
    }
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AuthError("Invalid credentials");
    }

    const payload = {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tokenType: "access"
    };

    const token = sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
}

/**
 * Registers a new user with email verification
 * Creates a pending registration and sends a 6-digit verification code via email
 * @param {string} email - The user's email address
 * @param {string} username - The user's desired username
 * @param {string} password - The user's password (must be 8-30 chars with uppercase, lowercase, number, and special char)
 * @returns {Promise<{email: string}>} Object containing the normalized email
 * @throws {AuthError} If email format is invalid, password doesn't meet requirements, or email/username already exists
 */
async function registerUser(email, username, password) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = username?.trim();
    const normalizedUsernameKey = normalizeUsername(username);

    // this is a basic email format check: must contain @ with characters on both sides and end with .com
    console.log("Registering user with email:", normalizedEmail);
    const atIndex = normalizedEmail?.indexOf("@") ?? -1;
    if (atIndex <= 0 || atIndex >= normalizedEmail.length - 1) {
        throw new AuthError("Please enter a valid email address");
    }

    // this enforces the password length bounds
    if (!password || password.length < 8) {
        throw new AuthError("Password must be at least 8 characters");
    }
    if (password.length > 30) {
        throw new AuthError("Password must be 30 characters or fewer");
    }

    // by regex system enforces to have at least one uppercase, one lowercase, one number and one special character
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!uppercaseRegex.test(password)) {
        throw new AuthError("Password must contain at least one uppercase letter");
    }
    if (!lowercaseRegex.test(password)) {
        throw new AuthError("Password must contain at least one lowercase letter");
    }
    if (!numberRegex.test(password)) {
        throw new AuthError("Password must contain at least one number");
    }
    if (!specialCharRegex.test(password)) {
        throw new AuthError("Password must contain at least one special character");
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: normalizedEmail },
                { fullName: { equals: normalizedUsername, mode: "insensitive" } }
            ]
        },
        select: {
            userId: true,
            email: true,
            fullName: true
        }
    });

    if (existingUser) {
        if (existingUser.email === normalizedEmail) {
            throw new AuthError("Email already in use");
        } else if (existingUser.fullName?.toLowerCase() === normalizedUsernameKey) {
            throw new AuthError("Username already in use");
        }
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = String(randomInt(0, 1000000)).padStart(6, "0");
    const verificationCodeHash = await hashPassword(verificationCode);
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    await prisma.pendingRegistration.upsert({
        where: { email: normalizedEmail },
        create: {
            email: normalizedEmail,
            fullName: normalizedUsername,
            passwordHash,
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: new Date(),
            resendCount: 0,
            attemptCount: 0
        },
        update: {
            fullName: normalizedUsername,
            passwordHash,
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: new Date(),
            attemptCount: 0,
            resendCount: { increment: 1 }
        }
    });

    await sendVerificationEmail({ to: normalizedEmail, code: verificationCode });

    return { email: normalizedEmail };
}

/**
 * Verifies a registration code and completes user registration
 * Creates the user account and sets up default goals upon successful verification
 * @param {string} email - The user's email address
 * @param {string} code - The 6-digit verification code
 * @returns {Promise<Object>} The newly created user object
 * @throws {AuthError} If code is invalid, expired, too many attempts, or email/username already taken
 */
async function verifyRegistrationCode(email, code) {
    const normalizedEmail = normalizeEmail(email);

    if (!code || !/^\d{6}$/.test(code)) {
        throw new AuthError("Verification code must be a 6-digit number");
    }

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
        where: { email: normalizedEmail }
    });

    if (!pendingRegistration) {
        throw new AuthError("No pending registration found for this email");
    }

    if (pendingRegistration.codeExpiresAt < new Date()) {
        throw new AuthError("Invalid or expired verification code");
    }

    if (pendingRegistration.attemptCount >= 5) {
        throw new AuthError("Too many verification attempts. Please request a new code.");
    }

    const isCodeValid = await verifyPassword(code, pendingRegistration.verificationCodeHash);
    if (!isCodeValid) {
        await prisma.pendingRegistration.update({
            where: { email: normalizedEmail },
            data: { attemptCount: { increment: 1 } }
        });
        throw new AuthError("Invalid or expired verification code");
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: pendingRegistration.email },
                { fullName: { equals: pendingRegistration.fullName, mode: "insensitive" } }
            ]
        },
        select: {
            userId: true,
            email: true,
            fullName: true
        }
    });

    if (existingUser) {
        if (existingUser.email === pendingRegistration.email) { 
            throw new AuthError("Email already in use");
        }
        if (existingUser.fullName?.toLowerCase() === pendingRegistration.fullName?.toLowerCase()) {
            throw new AuthError("Username already in use");
        }
    }

    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: pendingRegistration.email,
                fullName: pendingRegistration.fullName,
                passwordHash: pendingRegistration.passwordHash,
                role: "default"
            }
        });

        await ensureDefaultGoalsForUser({ userId: user.userId, demographic: "adult", tx });

        await tx.pendingRegistration.delete({
            where: { email: pendingRegistration.email }
        });

        return user;
    });

    return newUser;
}

/**
 * Resends a verification code to a pending registration email
 * Generates a new 6-digit code and enforces a 10-second cooldown between requests
 * @param {string} email - The user's email address
 * @returns {Promise<{email: string}>} Object containing the normalized email
 * @throws {AuthError} If no pending registration exists or cooldown period hasn't elapsed
 */
async function resendRegistrationCode(email) {
    const normalizedEmail = normalizeEmail(email);

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
        where: { email: normalizedEmail }
    });

    if (!pendingRegistration) {
        throw new AuthError("No pending registration found for this email");
    }

    const now = new Date();
    const cooldownMs = 10 * 1000;
    const msSinceLastSent = now.getTime() - pendingRegistration.lastSentAt.getTime();
    if (msSinceLastSent < cooldownMs) {
        throw new AuthError("Please wait before requesting a new code");
    }

    const verificationCode = String(randomInt(0, 1000000)).padStart(6, "0");
    const verificationCodeHash = await hashPassword(verificationCode);
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.pendingRegistration.update({
        where: { email: normalizedEmail },
        data: {
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: now,
            attemptCount: 0,
            resendCount: { increment: 1 }
        }
    });

    await sendVerificationEmail({ to: normalizedEmail, code: verificationCode });

    return { email: normalizedEmail };
}

/**
 * Generates a refresh token for a user and stores it in the database
 * @param {string} email - The user's email address
 * @returns {Promise<string>} JWT refresh token valid for 7 days
 * @throws {UserNotFoundError} If no user exists with the provided email
 */
async function generateRefreshToken(email) {
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (!user) {
        throw new UserNotFoundError();
    }

    const jti = randomUUID();
    const payload = { 
        userId: user.userId,
        tokenType: "refresh",
        jti
    };

    const refreshToken = sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
        data: {
            userId: user.userId,
            token: refreshToken,
            jti,
            expiresAt
        }
    });

    return refreshToken;
}

/**
 * Generates a new access token from a valid refresh token
 * @param {string} refreshToken - The JWT refresh token
 * @returns {Promise<{token: string, email: string}>} Object containing new access token and user email
 * @throws {AuthError} If refresh token is invalid, expired, or not found in database
 */
async function refreshAccessToken(refreshToken) {
    try {
        const decoded = verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.tokenType !== "refresh") {
            throw new AuthError("Invalid refresh token");
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { jti: decoded.jti },
            include: { user: true }
        });

        if (!storedToken || storedToken.token !== refreshToken) {
            throw new AuthError("Invalid refresh token");
        }

        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { jti: decoded.jti } });
            throw new AuthError("Invalid refresh token");
        }

        const user = storedToken.user;

        const payload = {
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            tokenType: "access"
        };

        const newAccessToken = sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        return { token: newAccessToken, email: user.email };
    } catch (error) {
        throw new AuthError("Invalid refresh token");
    }
}

/**
 * Revokes a refresh token by removing it from the database
 * In failure, does not throw an error
 * @param {string} refreshToken - The JWT refresh token to revoke
 * @returns {Promise<void>}
 */
async function revokeRefreshToken(refreshToken) {
    try {
        const decoded = verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.tokenType !== "refresh") {
            return;
        }

        await prisma.refreshToken.delete({
            where: { jti: decoded.jti }
        });
    } catch (error) {
        // Do nothing (maybe logging in the future)
    }
}

export { authenticateUser, registerUser, verifyRegistrationCode, resendRegistrationCode, generateRefreshToken, refreshAccessToken, revokeRefreshToken };
