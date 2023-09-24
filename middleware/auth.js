const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token =
        req.body.token || req.query.token || request.headers["x-access-token"];
    if (!token) {
        throw res.status(403).json({
            success: false,
            message: "Token required for authentication",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
    } catch (e) {
        console.log(e);
        return res
            .status(401)
            .json({ success: false, message: "Invalid token" });
    }
    return next();
}

module.exports = verifyToken;
