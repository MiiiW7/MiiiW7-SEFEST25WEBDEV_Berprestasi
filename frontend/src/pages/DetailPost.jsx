// src/pages/DetailPost.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const DetailPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);

        // Fetch post details
        const response = await axios.get(`${BACKEND_URL}/post/${id}`);

        if (response.data.success) {
          setPost(response.data.data);

          // If user is logged in, check if they're following this post
          if (user && token) {
            const followedResponse = await axios.get(
              `${BACKEND_URL}/user/followed-posts`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const followedPosts = followedResponse.data.data;
            setIsFollowed(followedPosts.some((p) => p.id === id));
          }
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Error fetching post details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, user, token]);

  // Format tanggal
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "Tanggal tidak tersedia";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const handleFollow = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const endpoint = isFollowed ? "unfollow" : "follow";
      await axios.post(
        `${BACKEND_URL}/post/${id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowed(!isFollowed);
    } catch (error) {
      console.error("Error following/unfollowing post:", error);
    }
  };

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto p-4">
          <button
            onClick={handleBack}
            className="inline-block mb-4 text-blue-500 hover:text-blue-700"
          >
            &larr; Kembali
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto p-4">
          <Link
            to="/"
            className="inline-block mb-4 text-blue-500 hover:text-blue-700"
          >
            &larr; Kembali
          </Link>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Post not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1100px]">
        <button
          onClick={handleBack}
          className="inline-block mb-4 text-blue-500 hover:text-blue-700"
        >
          &larr; Kembali
        </button>
        <div className="justify-items-center bg-white rounded-xl shadow-md border border-gray-100 md:flex lg:flex xl:flex ">
          <div className="relative w-1/2">
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
                console.log("Error loading image:", post.image);
              }}
            />
          </div>
          <div className="bg-white shadow-lg rounded-lg w-full">
            <div className="p-4 h-full flex flex-col">
              <div>
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-700 mb-4">{post.description}</p>
              </div>
              <div className="mt-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-4 py-auto">
                  {Array.isArray(post.categories)
                    ? post.categories.map((category, index) => (
                        <div
                          key={index}
                          className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                        >
                          {category}
                        </div>
                      ))
                    : post.category && <div>{post.category}</div>}
                </div>
                {/* Jenjang */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Jenjang</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.jenjangs.map((jenjang, index) => (
                      <span
                        key={index}
                        className="bg-yellow-200 px-3 py-1 rounded-full text-sm"
                      >
                        {jenjang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tambahkan informasi tanggal dan status */}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">
                      <strong>Tanggal Pelaksanaan:</strong>{" "}
                      {formatTanggal(post.pelaksanaan)}
                    </p>
                  </div>
                </div>

                <span className="text-sm text-gray-500">
                      Status: {post.status}
                </span>

                <div>
                  <span className="text-sm text-gray-500">
                    By: {post.creator?.name || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {user && user.role === "pendaftar" && (
          <button
            onClick={handleFollow}
            className={`mt-4 px-6 py-2 rounded-full ${
              isFollowed
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DetailPost;
