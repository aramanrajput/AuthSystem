import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../axios/instance";
import { Button, Typography } from "@mui/material";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile,setProfile] = useState('');
  useEffect(()=>{
    getUserProfile()
      },[])

      async function getUserProfile() {
try{
 let userProfile = await  apiClient.get('auth/profile',{withCredentials:true})
setProfile(userProfile.data);
}catch(err){

}
      }
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, Email : {profile.email}</p>
      <Typography>Role : {profile.role}</Typography>
      <Button onClick={logout}>Logout</Button>
     
  
    </div>
  );
};

export default Dashboard;
