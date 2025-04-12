import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";


const Verify = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const collegeId = location.state?.collegeId;

  // Redirect if collegeId is not available
  useEffect(() => {
    if (!collegeId) {
      navigate("/login");
    }
  }, [collegeId, navigate]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/otp/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ collegeId, otp })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "OTP verification failed");
      } else {
        localStorage.setItem("token", data.token);
        setVerified(true);
      }
    } catch (err) {
      setError("Verification failed.");
      console.error(err);
    }
  };

  // Navigate after successful verification
  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => {
        navigate("/user");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [verified, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#C5E6A6] p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#30343F] text-center mb-6">
          Verify OTP
        </h1>
        {verified ? (
          <p className="text-green-600 text-center font-semibold">
            🎉 OTP Verified! Redirecting...
          </p>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-[#30343F] mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#248232]"
                placeholder="6-digit OTP"
                required
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#248232] hover:bg-green-700 text-white py-2 rounded-lg"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Verify;
