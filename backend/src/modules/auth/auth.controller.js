import { authenticateUser, AuthError, UserNotFoundError, registerUser, verifyRegistrationCode, resendRegistrationCode, generateRefreshToken, refreshAccessToken, revokeRefreshToken } from "./auth.service.js";

/**
 * Handles user login requests
 * Authenticates user credentials and returns access token with refresh token cookie
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with access token or error message
 */
async function login(req, res) {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const token = await authenticateUser(email, password);

        const refreshToken = await generateRefreshToken(email); 
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

/**
 * Handles user registration requests
 * Creates a pending registration and sends verification code via email
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.username - User's desired username
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with success message or error
 */
async function register(req, res) {
    const { email, username, password } = req.body;

    try {
        if (!email || !username || !password) {
            return res.status(400).json({ message: "Email, username, and password are required" });
        }

        await registerUser(email, username, password);
        return res.status(200).json({ message: "Verification code sent. Complete verification to finish registration." });
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

/**
 * Handles verification of registration code
 * Completes user registration upon successful code verification
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.code - 6-digit verification code
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with user ID or error message
 */
async function verifyRegistration(req, res) {
    const { email, code } = req.body;

    try {
        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }

        const user = await verifyRegistrationCode(email, code);
        return res.status(201).json({ message: "User registered successfully", userId: user.userId });
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.message.includes("already in use")) {
                return res.status(409).json({ message: error.message });
            }
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * Handles resending of verification code
 * Generates and sends a new verification code to the user's email
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with success message or error
 */
async function resendVerificationCode(req, res) {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        await resendRegistrationCode(email);
        return res.status(200).json({ message: "Verification code resent successfully." });
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * Handles refresh token requests
 * Validates refresh token and issues new access and refresh tokens (token rotation)
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.cookies.refreshToken - JWT refresh token from cookie
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with new access token or error message
 */
async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }
    
        const { token, email } = await refreshAccessToken(refreshToken);
        
        // Rotate refresh token - delete old one and create new one
        await revokeRefreshToken(refreshToken);
        const newRefreshToken = await generateRefreshToken(email);
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        return res.json({ message: "Token refreshed successfully", token });

    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }

}

/**
 * Handles user logout requests
 * Revokes refresh token and clears the refresh token cookie
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.cookies.refreshToken - JWT refresh token from cookie
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with success message
 */
async function logoutController(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }
    
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.json({ message: "Logged out successfully" });
}

export { login, register, verifyRegistration, resendVerificationCode, refreshToken, logoutController };