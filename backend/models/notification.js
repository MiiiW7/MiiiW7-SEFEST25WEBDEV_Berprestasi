// models/notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String, // Ganti ke String sesuai dengan user model
    ref: 'User',
    required: true
  },
  postId: {
    type: String, // Ganti ke String sesuai dengan post model
    ref: 'Post'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['upcoming', 'today', 'general'],
    default: 'general'
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;