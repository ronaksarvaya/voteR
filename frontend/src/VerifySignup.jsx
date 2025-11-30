import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";

const VerifySignup = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Try to get email from location state (from signup)
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    // Countdown timer
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email) {
      setError("Email is required");
      return;
    }

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        setSuccess("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setResendLoading(true);
    setResendMessage("");
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setResendMessage("OTP resent successfully! Check your email.");
        setTimeLeft(600); // Reset timer
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#30343F]">Verify Your Email</h2>
          <p className="text-gray-600">We've sent a 6-digit code to your email</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
              required 
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-center">Enter OTP</label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-[#248232] transition"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-600">
                Time remaining: <span className="font-semibold text-[#248232]">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-semibold">OTP expired! Please request a new one.</p>
            )}
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

          {resendMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">ℹ️</span>
              {resendMessage}
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
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="w-full bg-white text-[#248232] border-2 border-[#248232] py-3 rounded-lg font-semibold hover:bg-green-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {resendLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#248232]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resending...
              </>
            ) : (
              "Resend OTP"
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

export default VerifySignup;
