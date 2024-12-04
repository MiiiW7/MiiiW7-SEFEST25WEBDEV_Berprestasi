/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const NotificationPenyelenggara = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/user/notifications/penyelenggara`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Log response untuk debugging
      console.log("Fetch notifications response:", response.data);

      // Set notifikasi dari response
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.response?.data?.message || "Gagal mengambil notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menandai semua notifikasi sebagai dibaca
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/user/notifications/penyelenggara/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh notifikasi setelah ditandai
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Fungsi untuk menghapus satu notifikasi
  const deleteNotification = async (notificationId) => {
    try {
      // Konfirmasi penghapusan
      const confirmDelete = window.confirm(
        "Apakah Anda yakin ingin menghapus notifikasi ini?"
      );
      if (!confirmDelete) return;

      // Pastikan menggunakan ID yang benar
      const response = await axios.delete(
        `${BACKEND_URL}/user/notifications/penyelenggara/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Tampilkan pesan sukses
      alert(response.data.message || "Notifikasi berhasil dihapus");

      // Refresh daftar notifikasi
      fetchNotifications();
    } catch (error) {
      // Tangani error
      console.error("Full error deleting notification:", error);

      alert(error.response?.data?.message || "Gagal menghapus notifikasi");
    }
  };

  // Fungsi untuk menghapus semua notifikasi
  const deleteAllNotifications = async () => {
    try {
      const confirmDelete = window.confirm(
        "Apakah Anda yakin ingin menghapus SEMUA notifikasi?"
      );
      if (!confirmDelete) return;
  
      console.log("Deleting notifications with:", {
        url: `${BACKEND_URL}/user/notifications`,
        token: token,
        userRole: user.role
      });
  
      const response = await axios.delete(
        `${BACKEND_URL}/user/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Delete response:", response);
  
      alert(response.data.message || "Semua notifikasi berhasil dihapus");
      fetchNotifications();
    } catch (error) {
      console.error("Full error details:", {
        response: error.response,
        request: error.request,
        message: error.message,
        config: error.config
      });
  
      alert(
        error.response?.data?.message || 
        "Gagal menghapus semua notifikasi"
      );
    }
  };

  useEffect(() => {
    if (user && user.role === "penyelenggara") {
      fetchNotifications();
      markAllNotificationsAsRead();
    }
  }, [user, token]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Notifikasi Penyelenggara</h1>
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
                <div className="flex items-center space-x-4">
                  {/* Gambar post */}
                  {notification.post && (
                    <img
                      src={`http://localhost:9000${notification.post.image}`}
                      alt={notification.post.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}

                  <div>
                    <p className="font-semibold">{notification.message}</p>
                    {notification.post && (
                      <p className="text-sm text-gray-600">
                        Lomba: {notification.post.title}
                      </p>
                    )}
                    {notification.follower && (
                      <p className="text-xs text-gray-500">
                        Dari: {notification.follower.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString(
                        "id-ID",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {notification.post && (
                    <Link
                      to={`/post/${notification.post.id}`}
                      className="text-blue-500 hover:text-blue-600 mr-2"
                    >
                      Lihat Lomba
                    </Link>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination atau Load More (opsional) */}
          {notifications.length > 0 && (
            <div className="flex justify-center mt-6">
              <p className="text-gray-500">
                Menampilkan {notifications.length} notifikasi
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotificationPenyelenggara;
