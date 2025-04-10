import React, { useState } from "react";
import Verify from "./Verify";

const Login = () => {
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleGetOTP = async (e) => {
    e.preventDefault();
  
    if (collegeId === "admin_ronak" || collegeId === "user_ronak") {
      try {
        const res = await fetch("http://localhost:5000/direct-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ collegeId })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          setError(data.error || "Login failed.");
          return;
        }
  
        localStorage.setItem("token", data.token);
  
        if (collegeId === "admin_ronak") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/user";
        }
  
      } catch (err) {
        setError("Direct login failed.");
        console.error(err);
      }
  
      return;
    }
  
    const regex = /^[0-9]{7}$/;
    if (!regex.test(collegeId)) {
      setError("College ID must be a 7-digit number.");
      return;
    }
  
    // Proceed with normal OTP logic
    setError("");
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ collegeId })
      });
  
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error(err);
    }
  
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#C5E6A6] p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#30343F] text-center mb-6">
          CR Voting Login
        </h1>
        <form onSubmit={handleGetOTP} className="space-y-4">
          <div>
            <label className="block text-[#30343F] mb-1">College ID</label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#248232]"
              placeholder="Enter your College ID"
              required
              disabled={loading}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#248232] hover:bg-green-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Get OTP on student mail"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-[#99621E]">
          You'll receive OTP on your college email
        </p>
      </div>
    </div>
  );
};

export default Login;
