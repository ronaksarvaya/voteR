import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Verification Successful! Redirecting to login...");
        navigate("/login");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Verify OTP</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#248232] placeholder-slate-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md hover:shadow-green-900/20"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
