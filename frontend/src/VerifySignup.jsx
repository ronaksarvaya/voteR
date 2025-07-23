import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";

const VerifySignup = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Try to get email from location state (from signup)
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email) { setError("Email is required"); return; }
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Verification failed");
      else {
        setSuccess("Email verified! You can now log in.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">OTP</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Enter the 6-digit OTP" />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <button className="w-full bg-[#248232] text-white py-2 rounded-lg font-semibold" type="submit">
          Verify
        </button>
      </form>
    </div>
  );
};

export default VerifySignup; 