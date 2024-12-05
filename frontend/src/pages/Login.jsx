import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi form
    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Format email tidak valid");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const userData = await login(formData);
      console.log("Login berhasil:", userData);
      navigate("/");
    } catch (error) {
      console.log("Error detail:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setError("Email atau password salah");
              break;
            case 404:
              setError("Email belum terdaftar");
              break;
            case 400:
              setError(
                error.response.data.message ||
                  "Data yang dimasukkan tidak valid"
              );
              break;
            case 500:
              setError("Terjadi kesalahan pada server");
              break;
            default:
              setError("Terjadi kesalahan. Silakan coba lagi");
          }
        } else if (error.request) {
          setError("Tidak dapat terhubung ke server");
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi");
        }
      } else {
        setError(error.message || "Terjadi kesalahan. Silakan coba lagi");
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
            Welcome Back!
          </h1>
          <p className="text-white text-sm md:text-base mt-2 hidden md:block">
            Login to access your account
          </p>
        </div>

        {/* Kolom kanan - Form Login */}
        <div className="p-6 md:p-10 w-full">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Login to your account
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Welcome back! Please login to your account.
            </p>
          </div>

          {/* Pesan Error */}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form className="space-y-4" onSubmit={handleSubmit}>
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

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white 
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed 
              flex justify-center items-center"
            >
              {loading ? (
                <>
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
                  Processing
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Link Registrasi */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don{"'"}t have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-600 hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
