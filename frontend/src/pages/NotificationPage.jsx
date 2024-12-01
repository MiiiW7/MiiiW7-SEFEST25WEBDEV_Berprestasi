/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/navbar';

const NotificationPage = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Detailed notification fetch error:", error);
      setError(error.response?.data?.message || "Gagal mengambil notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/user/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh notifications after deletion
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError(error.response?.data?.message || "Gagal menghapus notifikasi");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear notifications
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      setError(error.response?.data?.message || "Gagal menghapus semua notifikasi");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          {notifications.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada notifikasi
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{notification.message}</p>
                {notification.postId && (
                  <p className="text-sm text-gray-600">
                    Lomba: {notification.postId.title}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              <button
                onClick={() => deleteNotification(notification._id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;