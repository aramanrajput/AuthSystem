import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import apiClient from "../axios/instance";

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password }, { withCredentials: true });
      localStorage.setItem("accessToken", res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(jwtDecode(res.data.accessToken));
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  const logout = async () => {
    try {
        await apiClient.post(
            "/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              withCredentials: true, 
            }
          );
          
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
