import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";

const Postlist = () => {
  const [dataPost, setDataPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  const BACKEND_URL = "http://localhost:9000"; 

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const postsResponse = await axios.get(`${BACKEND_URL}/post`);
        let posts = postsResponse.data.data || [];
        
        if (user && token) {
          try {
            const followedResponse = await axios.get(
              `${BACKEND_URL}/user/followed-posts`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            const followedPostIds = followedResponse.data.data.map(post => post.id);
            posts = posts.map(post => ({
              ...post,
              isFollowed: followedPostIds.includes(post.id)
            }));
            console.log(followedPostIds)
          } catch (followError) {
            console.error("Error fetching followed posts:", followError);
            // Tidak menghentikan render jika gagal fetch followed posts
          }
        }
  
        setDataPost(posts);
      } catch (err) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPosts();
  }, [user, token]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
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
          id={post.id}
          title={post.title}
          description={post.description}
          image={getImageUrl(post.image)}
          category={post.categories}
          creatorName={post.creator?.name || "Unknown"}
        />
      ))}
    </div>
  );
};

export default Postlist;
