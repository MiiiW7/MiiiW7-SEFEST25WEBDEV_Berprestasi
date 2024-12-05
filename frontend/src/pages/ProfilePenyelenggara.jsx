/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const ProfilePenyelenggara = () => {
  const { user, updateProfile, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nomor: user?.nomor || '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe dan ukuran file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan');
        return;
      }

      if (file.size > maxSize) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      setProfilePicture(file);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Buat FormData untuk mengirim data
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('nomor', formData.nomor);
    
    // Tambahkan profile picture jika ada
    if (profilePicture) {
      submitData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.put(
        'http://localhost:9000/user/profile', 
        submitData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // Update profil di context atau state
      updateProfile(response.data.data);
      
      // Reset state editing
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Tangani error
    }
  };

  // Fungsi untuk mendapatkan URL gambar profil
  const getProfilePictureUrl = () => {
    // Jika ada preview image (baru diupload), gunakan preview
    if (previewImage) return previewImage;
    
    // Jika ada foto profil dari user, gunakan URL backend
    if (user?.profilePicture) {
      return `http://localhost:9000${user.profilePicture}`;
    }
    
    // Jika tidak ada, gunakan default
    return '/default-avatar.png';
  };

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
          
          {/* Foto Profil */}
            <div className="relative">
              <input 
                type="file" 
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={!isEditing}
              />
              <label 
                htmlFor={isEditing ? "profilePicture" : undefined} 
                className={`cursor-${isEditing ? 'pointer' : 'default'}`}
              >
                <img 
                  src={getProfilePictureUrl()} 
                  alt="Foto Profil" 
                  className={`w-32 h-32 rounded-full object-cover border-4 ${
                    isEditing 
                      ? 'border-yellow-500 hover:opacity-75' 
                      : 'border-gray-300'
                  }`}
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                      Ubah Foto
                    </span>
                  </div>
                )}
              </label>
            </div>

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

        {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  name="nomor"
                  value={formData.nomor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset preview dan foto yang dipilih
                    setPreviewImage(null);
                    setProfilePicture(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 mb-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Edit Profil
                </button>
              </div>
            </div>
          )}

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-md p-6 ">
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

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:w-[500px] md:w-[700px] lg:w-[900px] xl:w-[1200px]">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-1/2">
                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="relative h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex flex-col p-4 w-1/2 h-full">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-700 text-xs line-clamp-3 mb-2">
                      {post.description.length > 100
                        ? `${post.description.substring(0, 100)}...`
                        : post.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-2 line-clamp-2">
                      {Array.isArray(post.categories)
                        ? post.categories.map((category, index) => (
                            <span
                              key={index}
                              className=" bg-gray-200 px-2 py-1 rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))
                        : post.category && (
                            <span className="inline-block bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
                              {post.category}
                            </span>
                          )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.jenjangs?.map((jenjang, index) => (
                        <span
                          key={index}
                          className="bg-yellow-200 px-2 py-1 rounded-full text-xs"
                        >
                          {" "}
                          {jenjang}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs mt-2">
                      <a>
                        Diikuti sebanyak: {post.followers?.length || 0} user
                      </a>
                    </div>
                    <div className="mb-2">
                      {/* Jika pelaksanaan adalah string tunggal */}
                      {post.pelaksanaan && (
                        <span className=" rounded-full text-xs">
                          {new Date(post.pelaksanaan).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 mb-2">
                      Status: {post.status}
                    </span>

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
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePenyelenggara;
