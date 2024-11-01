// middleware/auth.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak tersedia",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token tidak valid",
      error: error.message
    });
  }
};

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Access denied: you do not have the required role.' 
            });
        }
        next();
    };
};