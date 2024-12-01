// NotificationDropdown.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/user/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Gagal mengambil notifikasi', error);
      }
    };

    fetchNotifications();
    // Refresh notifikasi setiap 5 menit
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/user/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Gagal menandai notifikasi', error);
    }
  };

  return (
    <div className="relative">
      <button className="relative">
        <i className="fa fa-bell"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {unreadCount}
          </span>
        )}
      </button>
      
      <div className="dropdown-menu">
        {notifications.map(notification => (
          <div 
            key={notification._id} 
            className={`notification-item ${!notification.isRead ? 'unread' : ''
              // NotificationDropdown.jsx (lanjutan)
          }`}
          >
            <div className="notification-content">
              <p>{notification.message}</p>
              
              {/* Tampilkan detail post terkait */}
              {notification.postId && (
                <div className="notification-post-details">
                  <img 
                    src={getImageUrl(notification.postId.image)} 
                    alt={notification.postId.title} 
                    className="notification-post-image"
                  />
                  <div>
                    <h4>{notification.postId.title}</h4>
                    <p>
                      Tanggal: {formatTanggal(notification.postId.pelaksanaan)}
                    </p>
                    <p>Status: {notification.postId.status}</p>
                  </div>
                </div>
              )}
              
              {/* Tombol aksi */}
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification._id)}
                    className="mark-read-btn"
                  >
                    Tandai Dibaca
                  </button>
                )}
                <Link 
                  to={`/post/${notification.postId?.id}`} 
                  className="view-details-btn"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="no-notifications">
            Tidak ada notifikasi baru
          </div>
        )}
      </div>
    </div>
  );
};

// Fungsi utilitas pendukung
const getImageUrl = (imagePath) => {
  const BACKEND_URL = "http://localhost:9000";
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BACKEND_URL}${imagePath}`;
};

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
};

export default NotificationDropdown;