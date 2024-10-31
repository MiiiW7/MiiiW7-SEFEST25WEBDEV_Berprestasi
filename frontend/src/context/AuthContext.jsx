/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:9000/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.data);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Handle error (misalnya logout jika token invalid)
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
    };

    loadUserData();
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(
          `${API_URL}/user/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [token]);

  const checkAuth = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/user/auth/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token: newToken, data } = response.data;

      if (!newToken || !data) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(data);
      setError(null);
      return data;
    } catch (error) {
      console.error("Login error:", error.response || error);
      setError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      if (!token) {
        throw new Error("No token available");
      }

      const response = await axios.put(
        `${API_URL}/user/profile`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUser(response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Update failed";
      setError(errorMessage);
      throw error;
    }
  };

  const verifyToken = async () => {
    try {
      if (!token) return false;

      const response = await axios.get(`${API_URL}/user/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.success;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateProfile,
    checkAuth,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;