// routes/userRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Post from "../models/post.js";
import Notification from "../models/notification.js";
import { User } from "../models/user.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadProfile } from "../multer.js";

const router = express.Router();

// AUTH ROUTES
// Register User
router.post(
  "/auth/register",
  uploadProfile.single("profilePicture"),
  async (req, res) => {
    try {
      const { name, email, password, nomor, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Hapus file yang baru diupload jika user sudah ada
        if (req.file) {
          const filePath = path.join(__dirname, "..", req.file.path);
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Siapkan data profile picture
      const profilePicturePath = req.file
        ? `/uploads/profiles/${req.file.filename}`
        : "";

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        nomor,
        role: role || "pendaftar",
        profilePicture: profilePicturePath,
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
          profilePicture: savedUser.profilePicture,
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
  }
);

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

    // Generate JWT token dengan informasi lengkap
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
router.put(
  "/profile",
  verifyToken,
  uploadProfile.single("profilePicture"),
  async (req, res) => {
    try {
      // Cari user yang akan diupdate
      const user = await User.findOne({ id: req.user.id });

      // Siapkan data update
      const updateData = {
        name: req.body.name,
        email: req.body.email,
        nomor: req.body.nomor,
      };

      // Jika ada file baru diunggah
      if (req.file) {
        // Hapus foto profil lama jika ada (kecuali default)
        if (user.profilePicture && 
            user.profilePicture !== '/uploads/profiles/default-avatar.png') {
          const oldImagePath = path.join(__dirname, "..", user.profilePicture);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Set path foto profil baru
        updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
      }

      // Lakukan update
      const updatedUser = await User.findOneAndUpdate(
        { id: req.user.id },
        updateData,
        { new: true }
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui profil",
        error: error.message,
      });
    }
  }
);

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
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const post = await Post.findOne({ id: notification.postId });

        return {
          _id: notification._id,
          message: notification.message,
          postId: post
            ? {
                id: post.id,
                title: post.title,
              }
            : null,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        };
      })
    );

    // Hitung jumlah notifikasi yang belum dibaca
    const unreadCount = populatedNotifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: populatedNotifications,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
      error: error.message,
    });
  }
});

// Menandai semua notifikasi sebagai dibaca
router.put("/notifications/mark-all-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Semua notifikasi telah ditandai sebagai dibaca",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menandai notifikasi",
      error: error.message,
    });
  }
});

// Menghapus notifikasi
router.delete("/notifications/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message,
    });
  }
});

// Route untuk menghapus semua notifikasi
router.delete("/notifications", verifyToken, async (req, res) => {
  try {
    // Hapus semua notifikasi untuk user yang sedang login
    const result = await Notification.deleteMany({
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Semua notifikasi berhasil dihapus",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message,
    });
  }
});

// Route untuk notifikasi penyelenggara
router.get("/notifications/penyelenggara", verifyToken, async (req, res) => {
  try {
    // Pastikan hanya penyelenggara yang bisa mengakses
    if (req.user.role !== "penyelenggara") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Cari post milik penyelenggara
    const posts = await Post.find({ creator: req.user.id });
    const postIds = posts.map((post) => post.id);

    // Cari notifikasi yang terkait dengan post milik penyelenggara
    const notifications = await Notification.find({
      type: "follow",
      postId: { $in: postIds },
    }).sort({ createdAt: -1 });

    // Populate notifikasi dengan detail post dan user
    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const post = await Post.findOne({ id: notification.postId });
        const follower = await User.findOne({ id: notification.userId });

        return {
          _id: notification._id,
          message: notification.message,
          isRead: notification.isRead, // Tambahkan status isRead
          post: {
            id: post.id,
            title: post.title,
            image: post.image,
          },
          follower: {
            id: follower.id,
            name: follower.name,
            email: follower.email,
          },
          createdAt: notification.createdAt,
        };
      })
    );

    // Hitung jumlah notifikasi yang belum dibaca
    const unreadCount = populatedNotifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: populatedNotifications,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching penyelenggara notifications:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
    });
  }
});

router.put(
  "/notifications/penyelenggara/mark-all-read",
  verifyToken,
  async (req, res) => {
    try {
      // Pastikan hanya penyelenggara yang bisa mengakses
      if (req.user.role !== "penyelenggara") {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak",
        });
      }

      // Cari post milik penyelenggara
      const posts = await Post.find({ creator: req.user.id });
      const postIds = posts.map((post) => post.id);

      // Update semua notifikasi follow untuk post milik penyelenggara
      await Notification.updateMany(
        {
          type: "follow",
          postId: { $in: postIds },
          isRead: false,
        },
        {
          isRead: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "Semua notifikasi telah ditandai sebagai dibaca",
      });
    } catch (error) {
      console.error(
        "Error marking penyelenggara notifications as read:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Gagal menandai notifikasi",
        error: error.message,
      });
    }
  }
);

// Route untuk menghapus notifikasi penyelenggara spesifik
router.delete(
  "/notifications/penyelenggara/:id",
  verifyToken,
  async (req, res) => {
    try {
      // Pastikan hanya penyelenggara yang bisa mengakses
      if (req.user.role !== "penyelenggara") {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak",
        });
      }

      // Cari post milik penyelenggara
      const posts = await Post.find({ creator: req.user.id });
      const postIds = posts.map((post) => post.id);

      // Hapus notifikasi
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        type: "follow",
        postId: { $in: postIds },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notifikasi tidak ditemukan",
        });
      }

      res.status(200).json({
        success: true,
        message: "Notifikasi berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting penyelenggara notification:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus notifikasi",
        error: error.message,
      });
    }
  }
);

export default router;
