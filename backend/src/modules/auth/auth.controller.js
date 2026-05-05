import { authenticateUser, AuthError, UserNotFoundError, registerUser, generateRefreshToken, refreshAccessToken } from "./auth.service.js";

async function login(req, res) {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const { token, userId } = await authenticateUser(email, password);

        const refreshToken = generateRefreshToken(userId);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        return res.json({ message: "Login successful", token });
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof AuthError) {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function register(req, res) {
    const { email, username, password } = req.body;

    try {
        if (!email || !username || !password) {
            return res.status(400).json({ message: "Email, username, and password are required" });
        }

        const user = await registerUser(email, username, password);
        return res.status(201).json({ message: "User registered successfully", userId: user.userId });
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.message.includes("already in use")) { // even though currently only possible errors are email or username already in use, this is a safeguard for future error messages
                return res.status(409).json({ message: error.message });
            }
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }
    
        const token = await refreshAccessToken(refreshToken);
        return res.json({ message: "Token refreshed successfully", token });

    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }

}

async function logoutController(_req, res) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.json({ message: "Logged out successfully" });
}

export { login, register, refreshToken, logoutController };