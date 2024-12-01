// routes/notificationRoutes.js
import express from 'express';
import Notification from '../models/notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const notification = new Notification({
      userId: req.user.id, // Pastikan ini adalah string
      postId: post.id, // Pastikan ini adalah string yang valid
      message: `Pengingat: Lomba "${post.title}" akan dimulai besok!`
    });
    await notification.save();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil notifikasi'
    });
  }
});

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate notifikasi'
    });
  }
});

export default router;