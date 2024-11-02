// src/pages/DetailPost.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Axios from "axios";
import Navbar from "../components/navbar";

const DetailPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching post with ID:", id);

        const response = await Axios.get(`${BACKEND_URL}/post/${id}`);
        console.log("API Response:", response.data);

        if (response.data.success) {
          setPost(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch post details");
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Error fetching post details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
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
          <Link
            to="/"
            className="inline-block mb-4 text-blue-500 hover:text-blue-700"
          >
            &larr; Kembali
          </Link>
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto p-4">
          <Link
            to="/"
            className="inline-block mb-4 text-blue-500 hover:text-blue-700"
          >
            &larr; Kembali
          </Link>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg"; // Ganti dengan gambar placeholder
                console.log("Error loading image:", post.image);
              }}
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-700 mb-4">{post.description}</p>
              <div className="flex items-center gap-6">
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
                  By: {post.creator?.name || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPost;
