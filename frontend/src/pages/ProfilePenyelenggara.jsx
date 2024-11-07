/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/navbar";

const ProfilePenyelenggara = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const fetchUserPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/post/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setPosts(response.data.data);
        console.log(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`${BACKEND_URL}/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh posts after deletion
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(
        "Failed to delete post: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  useEffect(() => {
    if (user && user.role === "penyelenggara") {
      fetchUserPosts();
    }
  }, [user]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  if (user.role !== "penyelenggara") {
    return <div>Anda tidak memiliki akses ke halaman ini.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Profile Penyelenggara</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nama:</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Nomor Telepon:</p>
              <p className="font-semibold">{user.nomor}</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Daftar Lomba Yang Diselenggarakan
            </h2>
            <button
              onClick={() => (window.location.href = "/create-post")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Tambah Lomba
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Belum ada lomba yang diselenggarakan
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {post.description.length > 100
                      ? `${post.description.substring(0, 100)}...`
                      : post.description}
                  </p>
                  <div className="flex items-center mt-4">
                    {Array.isArray(post.categories)
                      ? post.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                          >
                            {category}
                          </span>
                        ))
                      : post.category && (
                          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                            {post.category}
                          </span>
                        )}
                    <span className="text-sm text-gray-500">
                      Status: {post.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/edit-post/${post.id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Apakah Anda yakin ingin menghapus lomba ini?"
                          )
                        ) {
                          deletePost(post.id);
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePenyelenggara;
