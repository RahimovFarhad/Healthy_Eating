import { checkUser, AuthError, UserNotFoundError, registerUser } from "./auth.service.js";

async function checkLogin(req, res) {
    const { email, username, password } = req.body;
    const loginIdentifier = email ?? username;

    try {
        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const token = await checkUser(loginIdentifier, password);

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

        const newUser = await registerUser(email, username, password);
        return res.status(201).json({ message: "User registered successfully", userId: newUser.userId });
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { checkLogin, register };
