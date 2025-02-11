import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>

              {user.role === "admin" && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Panel
                </Button>
              )}

              <Button color="secondary" variant="outlined" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
