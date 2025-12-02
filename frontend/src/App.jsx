import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Verify from "./Verify";
import User from "./User";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import Home from "./Home";
import CreateSession from "./CreateSession";
import JoinSession from "./JoinSession";
import SessionDashboard from "./SessionDashboard";
import Vote from "./Vote";
import Results from "./Results";
import Signup from "./Signup";
import VerifySignup from "./VerifySignup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import MySessions from "./MySessions";

function isLoggedIn() {
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
  } catch {
    localStorage.removeItem("token");
    return false;
  }
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-signup" element={<VerifySignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/create-session" element={<PrivateRoute><CreateSession /></PrivateRoute>} />
        <Route path="/my-sessions" element={<PrivateRoute><MySessions /></PrivateRoute>} />
        <Route path="/join-session" element={<PrivateRoute><JoinSession /></PrivateRoute>} />
        <Route path="/session/:sessionId" element={<PrivateRoute><SessionDashboard /></PrivateRoute>} />
        <Route path="/vote/:sessionId" element={<PrivateRoute><Vote /></PrivateRoute>} />
        <Route path="/results/:sessionId" element={<PrivateRoute><Results /></PrivateRoute>} />
        <Route path="/user" element={<PrivateRoute><User /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
