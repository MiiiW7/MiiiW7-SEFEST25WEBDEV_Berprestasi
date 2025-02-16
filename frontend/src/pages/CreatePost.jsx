/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Pastikan path ini benar

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Mengambil user dan token dari context

  const AVAILABLE_CATEGORIES = [
    "Akademik",
    "Non-Akademik",
    "Seni",
    "Olahraga",
    "Teknologi",
    "Bahasa",
    "Sains",
    "Matematika",
  ];

  const AVAILABLE_JENJANG = ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [],
    jenjangs: [],
    image: null,
    pelaksanaan: "",
    link: "",
    status: "Belum Dilaksanakan",
  });

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setError("");

    console.log("Categories before sending:", formData.categories);

    if (!user || !token) {
      setError("User tidak terautentikasi. Silakan login kembali.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categories", JSON.stringify(formData.categories));
      formDataToSend.append("jenjangs", JSON.stringify(formData.jenjangs));
      formDataToSend.append("pelaksanaan", formData.pelaksanaan);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("status", formData.status);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

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

      console.log("Post created:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat membuat post."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prevState) => {
      if (isChecked) {
        return {
          ...prevState,
          categories: [...prevState.categories, category],
        };
      } else {
        return {
          ...prevState,
          categories: prevState.categories.filter((c) => c !== category),
        };
      }
    });
  };

  const handleJenjangChange = (e) => {
    const jenjang = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prevState) => {
      if (isChecked) {
        return {
          ...prevState,
          jenjangs: [...prevState.jenjangs, jenjang],
        };
      } else {
        return {
          ...prevState,
          jenjangs: prevState.jenjangs.filter((j) => j !== jenjang),
        };
      }
    });
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
              Link Detail Lomba
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/detail-lomba"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori (pilih satu atau lebih)
            </label>
            <div className="space-y-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    name="categories"
                    value={category}
                    checked={formData.categories.includes(category)}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenjang (pilih satu atau lebih)
            </label>
            <div className="space-y-2">
              {AVAILABLE_JENJANG.map((jenjang) => (
                <div key={jenjang} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`jenjang-${jenjang}`}
                    name="jenjangs"
                    value={jenjang}
                    checked={formData.jenjangs.includes(jenjang)}
                    onChange={handleJenjangChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`jenjang-${jenjang}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {jenjang}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tambahkan input untuk tanggal pelaksanaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              name="pelaksanaan"
              value={formData.pelaksanaan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              min={new Date().toISOString().split("T")[0]} // Batasi tanggal minimal hari ini
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
