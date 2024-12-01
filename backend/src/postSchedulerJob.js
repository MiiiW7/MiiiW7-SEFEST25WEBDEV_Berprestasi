import cron from 'node-cron';
import Post from '../models/post.js';
import Notification from '../models/notification.js';

// Fungsi untuk membuat notifikasi
async function createNotification(userId, postId, message, type) {
  try {
    // Cek apakah notifikasi serupa sudah ada
    const existingNotification = await Notification.findOne({
      userId,
      postId,
      message,
      type
    });

    if (!existingNotification) {
      await Notification.create({
        userId,
        postId,
        message,
        type
      });
    }
  } catch (error) {
    console.error(`Error creating ${type} notification:`, error);
  }
}

// Notifikasi H-1 dan Hari H
cron.schedule('* * * * *', async () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  try {
    // Cari post untuk H-1
    const upcomingPosts = await Post.find({
      pelaksanaan: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'Belum Dilaksanakan'
    });

    for (const post of upcomingPosts) {
      // Notifikasi H-1
      for (const userId of post.followers) {
        await createNotification(
          userId, 
          post.id, 
          `Lomba ${post.title} akan dilaksanakan besok!`, 
          'upcoming'
        );
      }
    }

    // Cari post untuk Hari H
    const startingPosts = await Post.find({
      pelaksanaan: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'Belum Dilaksanakan'
    });

    for (const post of startingPosts) {
      // Notifikasi Hari H
      for (const userId of post.followers) {
        await createNotification(
          userId, 
          post.id, 
          `Lomba ${post.title} dimulai hari ini!`, 
          'today'
        );
      }
    }
  } catch (error) {
    console.error('Error in notification scheduler:', error);
  }
});

// Update status lomba
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    // Update post yang akan dimulai
    await Post.updateMany(
      {
        pelaksanaan: { $lte: now },
        status: 'Belum Dilaksanakan'
      },
      { 
        $set: { 
          status: 'Sedang Dilaksanakan',
          startedAt: now
        }
      }
    );

    // Update post yang sudah selesai
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await Post.updateMany(
      {
        pelaksanaan: { $lt: yesterday },
        status: 'Sedang Dilaksanakan'
      },
      { 
        $set: { 
          status: 'Telah Dilaksanakan',
          endedAt: now
        }
      }
    );

  } catch (error) {
    console.error('Error in post status scheduler:', error);
  }
});

export default cron;