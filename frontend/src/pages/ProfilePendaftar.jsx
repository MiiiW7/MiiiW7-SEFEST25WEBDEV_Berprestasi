// src/pages/ProfilePendaftar.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const ProfilePendaftar = () => {
  const { user, updateProfile, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    nomor: user?.nomor || "",
  });
  const [followedPosts, setFollowedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/user/followed-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedPosts(response.data.data);
        console.log(response)
      } catch (error) {
        console.error("Error fetching followed posts:", error);
        setError("Gagal mengambil data lomba yang diikuti");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchFollowedPosts();
    }
  }, [user, token]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleUnfollow = async (postId) => {
    if (
      window.confirm("Apakah Anda yakin ingin berhenti mengikuti lomba ini?")
    ) {
      try {
        await axios.post(
          `${BACKEND_URL}/post/${postId}/unfollow`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Refresh followed posts after unfollowing
        const response = await axios.get(`${BACKEND_URL}/user/followed-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedPosts(response.data.data);
      } catch (error) {
        console.error("Error unfollowing post:", error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profil Pendaftar</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nama:</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Nomor Telepon:
                </label>
                <input
                  type="text"
                  name="nomor"
                  value={profileData.nomor}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p>
                <strong>Nama:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Nomor Telepon:</strong> {user?.nomor}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit Profil
              </button>
            </div>
          )}
        </div>

        {/* Followed Posts Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Daftar Lomba yang Diikuti</h2>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedPosts.map((post) => (
              <div
                key={post.id}
                className="flex border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/post/${post.id}`} className="">
                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {post.description.length > 100
                      ? `${post.description.substring(0, 100)}...`
                      : post.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories?.map((category, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 px-2 py-1 rounded-full text-sm"
                      >
                        {" "}
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.jenjangs?.map((jenjang, index) => (
                      <span
                        key={index}
                        className="bg-yellow-200 px-2 py-1 rounded-full text-sm"
                      >
                        {" "}
                        {jenjang}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Created By:{" "}
                    {post.creator?.name || "Unknown"}
                  </div>
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-yellow-600 hover:text-yellow-700 text-sm"
                    >
                      Lihat Detail
                    </Link>
                    <button
                      onClick={() => handleUnfollow(post.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && !error && followedPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Anda belum mengikuti lomba apapun.
              </p>
              <Link
                to="/"
                className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Jelajahi Lomba
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="text-yellow-600 hover:text-yellow-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-center mt-2">Memuat...</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePendaftar;
