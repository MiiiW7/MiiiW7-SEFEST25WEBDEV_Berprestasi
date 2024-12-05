/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";

const getCategoryColor = (category) => {
  const categoryColors = {
    Akademik: "bg-blue-100 text-blue-800",
    "Non-Akademik": "bg-green-100 text-green-800",
    Seni: "bg-purple-100 text-purple-800",
    Olahraga: "bg-red-100 text-red-800",
    Teknologi: "bg-indigo-100 text-indigo-800",
    Bahasa: "bg-yellow-100 text-yellow-800",
    Sains: "bg-teal-100 text-teal-800",
    Matematika: "bg-pink-100 text-pink-800",
    default: "bg-gray-100 text-gray-800",
  };

  return categoryColors[category] || categoryColors.default;
};

const Post = ({
  id,
  title,
  description,
  image,
  categories,
  jenjangs,
  pelaksanaan,
  creatorName,
  profilePicture,
}) => {
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("56.25%");

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fungsi untuk mendapatkan URL profile picture
  const getProfilePictureUrl = () => {
    console.log("Profile Picture Input:", profilePicture);
  
    // Jika tidak ada profile picture atau undefined
    if (!profilePicture || profilePicture === 'undefined') {
      console.log("No profile picture, using default");
      return '/default-avatar.png';
    }
    
    // Jika profilePicture adalah path relatif dari backend
    if (typeof profilePicture === 'string') {
      if (profilePicture.startsWith('/uploads')) {
        const fullUrl = `http://localhost:9000${profilePicture}`;
        console.log("Constructed Full URL:", fullUrl);
        return fullUrl;
      }
      
      // Jika sudah full URL
      console.log("Using profile picture as is:", profilePicture);
      return profilePicture;
    }
  
    console.log("Unexpected profile picture format");
    return '/default-avatar.png';
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const calculatedAspectRatio = (naturalHeight / naturalWidth) * 100;

    const normalizedAspectRatio = Math.max(
      40,
      Math.min(75, calculatedAspectRatio)
    );
    setAspectRatio(`${normalizedAspectRatio}%`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/post/${id}`} className="block w-full">
      <div
        className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex"
        style={{
          aspectRatio: `1 / ${parseFloat(aspectRatio) / 100 + 0.4}`,
        }}
      >
        {/* Kontainer Gambar */}
        <div className="relative w-1/2" style={{ paddingTop: aspectRatio }}>
          {!imageError ? (
            <img
              className="absolute top-0 left-0 w-full h-full object-contain bg-gray-50"
              src={image}
              alt={title}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
        </div>

        {/* Konten Card */}
        <div className="p-4 flex flex-col  flex-grow w-1/2">
          {/* Judul */}
          <h2 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors">
            {title}
          </h2>

          {/* Deskripsi */}
          <p className="text-gray-700 text-sm line-clamp-4 mb-2 ">
            {description}
          </p>

          <div className="mt-auto">
            {/* Informasi Pembuat */}
            <div className="flex items-center mb-4">
              <div className="mr-2">
                <img
                  src={getProfilePictureUrl()}
                  alt={creatorName || "Unknown Creator"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {creatorName || "Unknown Creator"}
                </p>
              </div>
            </div>

            {/* Kategori - hanya menampilkan dua kategori */}
            <div className="flex flex-wrap gap-2">
              {categories &&
                categories.slice(0, 2).map((category, index) => (
                  <span
                    key={index}
                    className={`
                  text-xs px-2.5 py-1 rounded-full font-medium 
                  border transition-all duration-300 
                  ${getCategoryColor(category)}
                `}
                  >
                    {category}
                  </span>
                ))}
            </div>

            {/* Jenjang - hanya menampilkan jenjang */}
            <div className="flex flex-wrap gap-2 mt-2">
              {jenjangs &&
                jenjangs.slice(0, 2).map((jenjang, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all duration-300`}
                  >
                    {jenjang}
                  </span>
                ))}
            </div>

            {/* Tambahkan informasi tanggal dan status */}
            <div className="mt-2 pl-1">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs text-gray-600">
                    {formatTanggal(pelaksanaan)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Post;
