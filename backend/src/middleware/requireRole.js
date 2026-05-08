/**
 * Role-based access control middleware
 * Provides flexible role checking for protected routes
 * @module middleware/requireRole
 */

/**
 * Creates middleware to require a specific user role
 * Must be used after requireAuth middleware
 * @param {string} role - The required role (e.g., "professional", "admin")
 * @returns {Function} Express middleware function
 * @example
 * // Usage in routes:
 * router.get('/admin-only', requireAuth, requireRole('admin'), handler);
 */
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions" });
        }
        next();
    };
}

export { requireRole };