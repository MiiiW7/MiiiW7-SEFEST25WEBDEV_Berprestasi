import { useEffect, useState } from "react";
import axios from 'axios';
import Post from "./Post";

const Postlist = () => {
  const [dataPost, setDataPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = 'http://localhost:9000'; // Tambahkan ini

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${BACKEND_URL}/post`)
      .then(result => {
        console.log('API Response:', result.data);
        const responsesAPI = result.data;
        setDataPost(responsesAPI.data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.log('Error:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Update fungsi getImageUrl
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`; // Gunakan BACKEND_URL
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dataPost || dataPost.length === 0) return <div>No posts available</div>;

  return (
    <div className="flex flex-wrap justify-center">
      {dataPost.map((post) => (
        <Post 
          key={post._id}
          id={post._id}
          title={post.title}
          description={post.description}
          image={getImageUrl(post.image)}
          category={post.category}
          creatorName={post.creator?.name || 'Unknown'}
        />
      ))}
    </div>
  );
};

export default Postlist;