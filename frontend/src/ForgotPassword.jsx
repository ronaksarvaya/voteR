import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
      } else {
        setSuccess("If an account exists with this email, you will receive a password reset link shortly.");
        setEmail("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#30343F]">Forgot Password?</h2>
          <p className="text-gray-600">No worries! Enter your email and we'll send you a reset link.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
              required 
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-start">
                <span className="mr-2 mt-0.5">✅</span>
                <div>
                  <p className="font-semibold mb-1">Email Sent!</p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
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
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <span 
              className="text-[#248232] font-semibold cursor-pointer hover:underline" 
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span 
              className="text-[#248232] font-semibold cursor-pointer hover:underline" 
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
