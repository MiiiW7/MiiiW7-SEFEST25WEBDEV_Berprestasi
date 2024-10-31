/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Pastikan path ini benar

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Mengambil user dan token dari context

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    status: "published",
  });

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      console.error("No user or token available");
      setError("User tidak terautentikasi. Silakan login kembali.");
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("image", formData.image);
  
      const response = await axios.post(
        "http://localhost:9000/post",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Response:", response.data);
      navigate("/");
      
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        setError(error.response.data.message || "Terjadi kesalahan saat membuat post.");
      } else {
        setError("Terjadi kesalahan saat menghubungi server.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Buat Post Baru</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar
            </label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required
              className="w-full"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-2 max-w-xs rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-600"
              }`}
            >
              {loading ? "Memproses..." : "Buat Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
