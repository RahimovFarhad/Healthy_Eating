/**
 * Authentication middleware
 * Provides JWT token verification and role-based access control
 * @module middleware/requireAuth
 */

import jwt from "jsonwebtoken";

const { verify } = jwt;

/**
 * Middleware to require valid JWT authentication
 * Verifies the access token from Authorization header and attaches user data to request
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} Calls next() on success, returns 401 JSON response on failure
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET);

        if (decoded.tokenType !== "access") {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

/**
 * Middleware to require professional role
 * Must be used after requireAuth middleware
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object attached by requireAuth
 * @param {string} req.user.role - User's role
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} Calls next() if user is professional, returns 403 JSON response otherwise
 */
function requireProfessional(req, res, next) {
    if (req.user?.role !== "professional") {
        return res.status(403).json({ message: "Forbidden: Requires professional role" });
    }

    next();
}

export { requireAuth, requireProfessional };

