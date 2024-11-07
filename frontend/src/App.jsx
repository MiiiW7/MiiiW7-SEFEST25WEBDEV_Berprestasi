import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import DetailPost from "./pages/DetailPost";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import CategoryPage from "./pages/CategoryPage";
import EditPost from "./pages/EditPost";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post/:id" element={<DetailPost />} />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute roles={["penyelenggara"]}>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/kategori/:category" element={<CategoryPage />} />
        <Route
          path="/edit-post/:id"
          element={
            <ProtectedRoute role="penyelenggara">
              <EditPost />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
