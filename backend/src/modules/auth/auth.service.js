import { prisma } from "../../db/prisma.js";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../../utils/hash.js";
import { ensureDefaultGoalsForUser } from "../goals/goals.service.js";

const { sign, verify } = jwt;

export class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

export class UserNotFoundError extends AuthError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

async function authenticateUser(email, password) {
    const user = await prisma.user.findUnique({
        where: { email }
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
        role: user.role,
        tokenType: "access"
    };

    const token = sign(payload, process.env.JWT_SECRET || "default-secret-key", { expiresIn: "1h" });
    return token;
}

async function registerUser(email, username, password) {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AuthError("Email already in use");
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
        data: {
            email,
            fullName: username,
            passwordHash: passwordHash,
            role: "default",
        },
        });

        await ensureDefaultGoalsForUser({ userId: user.userId, demographic: "adult", tx });

        return user;
    });

    return newUser;
}

async function generateRefreshToken(email) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new UserNotFoundError();
    }

    // This implementation is enough for now, but we will store the refreshtoken in the database later, so we can invalidate it if needed. 
    // That means we will also include a unique identifier for the token in the payload, so we can find it in the database later.
    const payload = { 
        userId: user.userId,
        tokenType: "refresh"
    };

    const refreshToken = sign(payload, process.env.JWT_SECRET || "default-secret-key", { expiresIn: "7d" });
    // Optionally, you can store the refresh token in the database for later validation.
    return refreshToken;
}

async function refreshAccessToken(refreshToken) {
    try {
        const decoded = verify(refreshToken, process.env.JWT_SECRET || "default-secret-key");

        if (decoded.tokenType !== "refresh") {
            throw new AuthError("Invalid refresh token");
        }

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { userId }
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        const payload = {
            userId: user.userId,
            email: user.email,
            role: user.role,
            tokenType: "access"
        };

        const newAccessToken = sign(payload, process.env.JWT_SECRET || "default-secret-key", { expiresIn: "1h" });
        return newAccessToken;
    } catch (error) {
        throw new AuthError("Invalid refresh token");
    }
}

export { authenticateUser, registerUser, generateRefreshToken, refreshAccessToken };
