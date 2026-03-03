import { prisma } from "../../db/prisma.ts";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../../utils/hash.js";

const { sign } = jwt;

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

async function checkUser(email, password) {
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
        role: user.role
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

    const newUser = await prisma.user.create({
        data: {
            email,
            fullName: username,
            passwordHash: passwordHash,
            role: "default"
        }
    });

    return newUser;
}

export { checkUser, registerUser };
