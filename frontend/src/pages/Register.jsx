import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nomor: "",
    profilePicture: null,
    role: "pendaftar", // default value
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe dan ukuran file
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setError("Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan");
        return;
      }

      if (file.size > maxSize) {
        setError("Ukuran file maksimal 2MB");
        return;
      }

      setFormData((prevState) => ({
        ...prevState,
        profilePicture: file,
      }));

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Reset error
      setError(null);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    //Validasi form
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.nomor
    ) {
      setError("Semua field harus diisi");
      return;
    }

    // Validasi password length
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid");
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("nomor", formData.nomor);
    submitData.append("role", formData.role);

    // Tambahkan profile picture jika ada
    if (formData.profilePicture) {
      submitData.append("profilePicture", formData.profilePicture);
    }

    try {
      const response = await axios.post(
        "http://localhost:9000/user/auth/register",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        console.log("Registration successful:", response.data);
        alert("Registrasi berhasil!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(
            error.response.data.message || "Terjadi kesalahan saat registrasi"
          );
        } else if (error.request) {
          setError("Tidak dapat terhubung ke server");
        }
      } else {
        setError("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl mx-auto overflow-hidden grid md:grid-cols-2 grid-cols-1">
        {/* Kolom kiri - Logo dan Deskripsi */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-300 p-6 md:p-10 flex flex-col justify-center items-center text-center">
          <img
            src="https://placehold.co/80x80"
            alt="Logo"
            className="mb-4 w-20 h-20 mx-auto"
          />
          <h1 className="text-white text-2xl md:text-4xl font-bold">
            Buat Akunmu Sekarang!
          </h1>
          <p className="text-white text-sm md:text-base mt-2 hidden md:block">
            Raih prestasi setinggi mungkin!
          </p>
        </div>

        {/* Kolom Kanan - Logo dan Deskripsi */}
        <div className="p-6 md:p-10 w-full">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Register Account
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Welcome! Buat Akunmu!.
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label
                  htmlFor="nomor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="nomor"
                  name="nomor"
                  type="tel"
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  placeholder="Enter your phone number"
                  value={formData.nomor}
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Foto Profil */}
              <div className="mb-4 flex flex-col items-center">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="profilePicture" className="cursor-pointer">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Pilih Foto</span>
                    </div>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Maksimal 2MB (JPEG, PNG, GIF)
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Daftar Sebagai
                </label>
                <div className="mt-1 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="pendaftar"
                      checked={formData.role === "pendaftar"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Pendaftar</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="penyelenggara"
                      checked={formData.role === "penyelenggara"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Penyelenggara</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
