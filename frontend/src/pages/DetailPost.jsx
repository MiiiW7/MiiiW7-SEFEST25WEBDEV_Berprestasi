// src/pages/DetailPost.jsx
import { useParams, Link } from "react-router-dom"; // import Link dan useParams dari react-router-dom
import { useState, useEffect } from "react"; // import useState dan useEffect dari react
import Axios from "axios";
import Navbar from "../components/navbar";

const DetailPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = 'http://localhost:9000'; // Tambahkan ini

  useEffect(() => {
    setIsLoading(true);
    Axios.get(`http://localhost:9000/post/${id}`)
      .then((result) => {
        setPost(result.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`; // Gunakan BACKEND_URL
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Navbar di luar container konten */}
      <main className="flex-grow">
        {" "}
        {/* Container untuk konten */}
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
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-700 mb-4">{post.description}</p>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {post.category}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPost;
