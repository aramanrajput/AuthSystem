import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../axios/instance";

const AdminPanel = () => {
  const { user } = useAuth();



  if (user.role !== "admin") {
    return <h2>Access Denied</h2>;
  }

  return <div>
    <h2>Admin Panel</h2>
    <p>Admin Actions Here</p>
  </div>;
};

export default AdminPanel;
