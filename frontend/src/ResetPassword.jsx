import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "./config";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-reset-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        
        if (res.ok) {
          setTokenValid(true);
        } else {
          const data = await res.json();
          setError(data.error || "Invalid or expired reset link");
          setTokenValid(false);
        }
      } catch (err) {
        setError("Failed to verify reset link");
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided");
      setValidatingToken(false);
    }
  }, [token]);

  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: "", color: "" };
    if (pass.length < 6) return { strength: "Weak", color: "text-red-500" };
    if (pass.length < 10) return { strength: "Medium", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <svg className="animate-spin h-12 w-12 text-[#248232] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#30343F]">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error || "This password reset link is invalid or has expired."}</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
          >
            Request New Link
          </button>
          <p className="mt-4 text-sm text-gray-600">
            <span 
              className="text-[#248232] font-semibold cursor-pointer hover:underline" 
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#30343F]">Reset Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {newPassword && (
              <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                Password strength: {passwordStrength.strength}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password"
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          )}

          <button 
            className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <span 
            className="text-[#248232] font-semibold cursor-pointer hover:underline" 
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
