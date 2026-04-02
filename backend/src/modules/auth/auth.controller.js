import { authenticateUser, AuthError, UserNotFoundError, registerUser, generateRefreshToken, refreshAccessToken } from "./auth.service.js";

async function login(req, res) {
    const { email, username, password } = req.body;
    const loginIdentifier = email ?? username;

    try {
        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const token = await authenticateUser(loginIdentifier, password);

        const refreshToken = await generateRefreshToken(loginIdentifier); 
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // as we will deploy backend on https, this should be true. 
            sameSite: "none", // for now, this will be used until we have the frontend and backend on the same domain in production. In development, this is required for cookies to work across localhost ports
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

export { login, register, refreshToken };
