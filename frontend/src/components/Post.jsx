/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";

const Post = ({
  id,
  title,
  description,
  image,
  category,
  creatorName,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.log("Image failed to load:", image);
    setImageError(true);
  };

  if (!id) {
    console.warn("Post ID is undefined");
    return null; // atau tampilkan fallback UI
  }

  return (
    <Link to={`/post/${id}`} className="block">
      <div className="p-4 m-4 w-80 bg-white shadow-md rounded-xl transition-transform hover:scale-105">
        <picture className="rounded-lg block overflow-hidden">
          {!imageError ? (
            <img
              className="w-full h-40 object-cover"
              src={image}
              alt={title}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span>Image not available</span>
            </div>
          )}
        </picture>
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{title}</div>
          <p className="text-gray-700 text-base line-clamp-3">{description}</p>
          <p className="text-gray-600 text-sm mt-2">
            Created by: {creatorName}
          </p>
        </div>
        <div className="px-6 pt-4 pb-2">
          {Array.isArray(category)
            ? category.map((cat, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                >
                  {cat}
                </span>
              ))
            : category && (
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {category}
                </span>
              )}
        </div>
      </div>
    </Link>
  );
};

export default Post;
