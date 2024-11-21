// routes/userRoutes.js
import express from "express";
import Post from "../models/post.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// AUTH ROUTES
// Register User
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, nomor, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      nomor,
      role: role || "pendaftar"
    });

    // Save user
    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        nomor: savedUser.nomor,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat registrasi",
      error: error.message
    });
  }
});

// Login User
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email belum terdaftar",
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        nomor: user.nomor,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat login",
      error: error.message,
    });
  }
});

// Logout User
router.post("/auth/logout", verifyToken, (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server
    // The client needs to remove the token
    res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat logout",
      error: error.message,
    });
  }
});

// Verify Token Status
router.get("/auth/verify", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      message: "Token valid",
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token tidak valid",
      error: error.message,
    });
  }
});

// Get User Profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select("-password");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil profil",
      error: error.message,
    });
  }
});

// Update User Profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, nomor } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { name, email, nomor },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil",
      error: error.message,
    });
  }
});

// Change Password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id);

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini salah",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengubah password",
      error: error.message,
    });
  }
});

// Get followed posts for a user
router.get("/followed-posts", verifyToken, async (req, res) => {
  try {
    const followedPosts = await Post.find({ followers: req.user.id });
    res.status(200).json({ success: true, data: followedPosts });
    console.log(followedPosts)
  } catch (error) {
    console.error("Error fetching followed posts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching followed posts", 
      error: error.message 
    });
  }
});


export default router;
