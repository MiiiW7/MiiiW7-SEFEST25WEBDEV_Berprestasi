import express from "express";
import upload from "../multer.js";
import Post from "../models/post.js";
import { User } from "../models/user.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, "../uploads");

// Pastikan folder uploads ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CREATE - Membuat post baru
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const categories = JSON.parse(req.body.categories); // Ubah ini untuk mengurai string JSON

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      categories: categories,
      creator: req.user.id,
      image: `/uploads/${req.file.filename}`,
      status: req.body.status || "published",
    });

    const savedPost = await post.save();

    res.status(201).json({
      message: "Post created successfully",
      data: savedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
});

// READ - Mendapatkan semua post
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().lean();

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        let creator = null;
        if (post.creator) {
          creator = await User.findOne({ id: post.creator }).lean();
        }
        return {
          ...post,
          creator: creator ? { id: creator.id, name: creator.name } : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data post",
      error: error.message,
    });
  }
});

// READ - Mendapatkan satu post berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ id: id }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Tambahkan ini untuk mengambil data creator
    const creator = await User.findOne({ id: post.creator }).lean();

    // Gabungkan data post dengan data creator
    const postWithCreator = {
      ...post,
      creator: creator ? { id: creator.id, name: creator.name } : null,
    };

    res.status(200).json({
      success: true,
      data: postWithCreator,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil detail post",
      error: error.message,
    });
  }
});

// Endpoint baru untuk mengambil post berdasarkan ID penyelenggara
// routes/postRoutes.js

router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;


    // Verifikasi akses berdasarkan peran
    if (req.user.id !== userId && req.user.role !== 'admin') {
      if (req.user.role === 'pendaftar') {
        // Pendaftar hanya bisa melihat post yang dipublish
        const publishedPosts = await Post.find({ creator: userId, status: 'published' });
        return res.status(200).json({
          success: true,
          data: publishedPosts
        });
      } else if (req.user.role !== 'penyelenggara') {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk mengakses post ini"
        });
      }
    }

    // Penyelenggara atau admin bisa melihat semua post
    const posts = await Post.find({ creator: userId });

    res.status(200).json({
      success: true,
      data: posts
    });

  } catch (error) {
    console.error("Error in /user/:userId:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil post",
      error: error.message
    });
  }
});

// UPDATE - Memperbarui post berdasarkan ID
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let updateData = {
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
    };

    // Jika ada file gambar baru
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate("creator", "id name");

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post berhasil diperbarui",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui post",
      error: error.message,
    });
  }
});

// DELETE - Menghapus post berdasarkan ID
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Hapus file gambar jika ada
    if (post.image) {
      const imagePath = join(__dirname, "..", post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Post.findOneAndDelete({ id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Post berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus post",
      error: error.message,
    });
  }
});

export default router;
