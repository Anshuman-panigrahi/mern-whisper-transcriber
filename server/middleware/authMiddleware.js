import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.warn("No authorization header provided");
        return res.status(401).json({
            message: "No Token",
            success: false
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        console.warn("Token not found in authorization header");
        return res.status(401).json({
            message: "No Token",
            success: false
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ Token verified for user:", decoded.id);
        req.user = decoded;
        next();

    } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        return res.status(401).json({
            message: "Invalid or Expired Token. Please login again.",
            success: false,
            error: error.message
        });
    }
};

export default authMiddleware;