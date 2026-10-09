const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found."
            });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};

module.exports = {
    protect
};