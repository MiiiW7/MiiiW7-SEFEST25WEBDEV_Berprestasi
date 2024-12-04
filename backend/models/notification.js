import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  postId: {
    type: String,
    ref: 'Post'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'upcoming', 'today', 'general'],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;