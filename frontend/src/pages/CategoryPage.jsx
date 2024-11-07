// src/pages/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Post from "../components/Post";

const CategoryPage = () => {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`; // Tambahkan ini
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${BACKEND_URL}/post/kategori/${category}`
        );
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Lomba Kategori: {category}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Post
              key={post._id}
              id={post.id}
              title={post.title}
              description={post.description}
              image={getImageUrl(post.image)}
              category={post.categories}
              creatorName={post.creator?.name}
            />
          ))}
        </div>
        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada lomba dalam kategori ini
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;