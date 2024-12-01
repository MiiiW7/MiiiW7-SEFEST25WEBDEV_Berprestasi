// routes/userRoutes.js
import express from "express";
import Post from "../models/post.js";
import Notification from "../models/notification.js";
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
      role: role || "pendaftar",
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
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat registrasi",
      error: error.message,
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

    const populatedPosts = await Promise.all(
      followedPosts.map(async (post) => {
        const creator = await User.findOne({ id: post.creator }).lean();
        return {
          ...post.toObject(),
          creator: creator ? { id: creator.id, name: creator.name } : null,
        };
      })
    );

    res.status(200).json({ success: true, data: populatedPosts });
  } catch (error) {
    console.error("Error fetching followed posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followed posts",
      error: error.message,
    });
  }
});

// Mendapatkan semua notifikasi
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    // Cari notifikasi berdasarkan userId
    const notifications = await Notification.find({ 
      userId: req.user.id 
    }).sort({ createdAt: -1 }); // Urutkan dari yang terbaru

    // Proses populate manual
    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        try {
          // Cari post berdasarkan ID (bukan ObjectId)
          const post = await Post.findOne({ id: notification.postId });
          
          return {
            _id: notification._id,
            userId: notification.userId,
            postId: post ? {
              id: post.id,
              title: post.title,
              image: post.image,
              pelaksanaan: post.pelaksanaan,
              status: post.status
            } : null,
            message: notification.message,
            type: notification.type,
            isRead: notification.isRead,
            createdAt: notification.createdAt
          };
        } catch (postError) {
          console.error('Error finding post for notification:', postError);
          return null;
        }
      })
    );

    // Filter notifikasi yang valid
    const validNotifications = populatedNotifications.filter(n => n !== null);

    // Hitung jumlah notifikasi yang belum dibaca
    const unreadCount = validNotifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: validNotifications,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error("Detailed error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
      error: error.message
    });
  }
});

// Menandai notifikasi sebagai dibaca
router.put("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Notifikasi ditandai sebagai dibaca" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Gagal menandai notifikasi" 
    });
  }
});

// Menandai semua notifikasi sebagai dibaca
router.put("/notifications/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Semua notifikasi ditandai sebagai dibaca" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Gagal menandai semua notifikasi" 
    });
  }
});

// Menghapus notifikasi
router.delete("/notifications/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notifikasi berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message
    });
  }
});

// Route untuk menghapus semua notifikasi
router.delete("/notifications", verifyToken, async (req, res) => {
  try {
    // Hapus semua notifikasi untuk user yang sedang login
    const result = await Notification.deleteMany({ 
      userId: req.user.id 
    });

    res.status(200).json({
      success: true,
      message: "Semua notifikasi berhasil dihapus",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message
    });
  }
});

export default router;
