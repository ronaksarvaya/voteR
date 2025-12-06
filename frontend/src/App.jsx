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
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./Layout";

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
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-signup" element={<VerifySignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/create-session" element={<CreateSession />} />
            <Route path="/my-sessions" element={<MySessions />} />
            <Route path="/join-session" element={<JoinSession />} />
            <Route path="/session/:sessionId" element={<SessionDashboard />} />
            <Route path="/vote/:sessionId" element={<Vote />} />
            <Route path="/results/:sessionId" element={<Results />} />
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
