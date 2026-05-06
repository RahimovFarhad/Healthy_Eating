import { prisma } from "../../db/prisma.js";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../../utils/hash.js";
import { ensureDefaultGoalsForUser } from "../goals/goals.service.js";
import { randomInt } from "node:crypto";
import { sendVerificationEmail } from "../../utils/email.js";

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
        fullName: user.fullName,
        role: user.role,
        tokenType: "access"
    };

    const token = sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { token, userId: user.userId };
}

async function registerUser(email, username, password) {
    // this is a basic email format check: must contain @ with characters on both sides and end with .com
    console.log("Registering user with email:", email);
    const atIndex = email?.indexOf("@") ?? -1;
    if (atIndex <= 0 || atIndex >= email.length - 1) {
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
                { email: email },
                { fullName: username }
            ]
        },
        select: {
            userId: true,
            email: true,
            fullName: true
        }
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new AuthError("Email already in use");
        } else if (existingUser.fullName === username) {
            throw new AuthError("Username already in use");
        }
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = String(randomInt(0, 1000000)).padStart(6, "0");
    const verificationCodeHash = await hashPassword(verificationCode);
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    await prisma.pendingRegistration.upsert({
        where: { email },
        create: {
            email,
            fullName: username,
            passwordHash,
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: new Date(),
            resendCount: 0,
            attemptCount: 0
        },
        update: {
            fullName: username,
            passwordHash,
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: new Date(),
            attemptCount: 0,
            resendCount: { increment: 1 }
        }
    });

    await sendVerificationEmail({ to: email, code: verificationCode });

    return { email };
}

async function verifyRegistrationCode(email, code) {
    if (!code || !/^\d{6}$/.test(code)) {
        throw new AuthError("Verification code must be a 6-digit number");
    }

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
        where: { email }
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
            where: { email },
            data: { attemptCount: { increment: 1 } }
        });
        throw new AuthError("Invalid or expired verification code");
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: pendingRegistration.email },
                { fullName: pendingRegistration.fullName }
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
        if (existingUser.fullName === pendingRegistration.fullName) {
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

async function resendRegistrationCode(email) {
    const pendingRegistration = await prisma.pendingRegistration.findUnique({
        where: { email }
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
        where: { email },
        data: {
            verificationCodeHash,
            codeExpiresAt,
            lastSentAt: now,
            attemptCount: 0,
            resendCount: { increment: 1 }
        }
    });

    await sendVerificationEmail({ to: email, code: verificationCode });

    return { email };
}

function generateRefreshToken(userId) {
    const payload = {
        userId,
        tokenType: "refresh"
    };
    return sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function refreshAccessToken(refreshToken) {
    try {
        const decoded = verify(refreshToken, process.env.JWT_SECRET);

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
            fullName: user.fullName,
            role: user.role,
            tokenType: "access"
        };

        const newAccessToken = sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        return newAccessToken;
    } catch (error) {
        throw new AuthError("Invalid refresh token");
    }
}

export { authenticateUser, registerUser, verifyRegistrationCode, resendRegistrationCode, generateRefreshToken, refreshAccessToken };
