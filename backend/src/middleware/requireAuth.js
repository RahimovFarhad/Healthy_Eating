import jwt from "jsonwebtoken";

const { verify } = jwt;


function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET || "default-secret-key");

        if (decoded.tokenType !== "access") {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export { requireAuth };
