import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Verify from "./Verify";
import User from "./User";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";

const App = () => {
  // Helper to check if token exists and is not expired (optional)
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      return false;
    }
  };

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to={isLoggedIn() ? "/user" : "/login"} />} />

        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />

        {/* Protected home page */}
        <Route path="/user" element={<User />} />
        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all route (optional) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
