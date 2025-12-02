import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetLink("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok && !data.resetLink) {
        setError(data.error || "Failed to send reset email");
      } else {
        setSuccess(data.message || "If an account exists with this email, you will receive a password reset link shortly.");
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
        setEmail("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">Forgot Password?</h2>
          <p className="text-slate-400">No worries! Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition placeholder-slate-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg">
              <div className="flex items-start">
                <span className="mr-2 mt-0.5">✅</span>
                <div>
                  <p className="font-semibold mb-1">Success!</p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          {resetLink && (
            <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg mt-4">
              <p className="text-blue-200 text-sm mb-2 font-semibold">Debug/Bypass Link:</p>
              <div className="bg-slate-900 p-2 rounded border border-slate-700 break-all text-xs font-mono text-slate-300 mb-2">
                {resetLink}
              </div>
              <a
                href={resetLink}
                className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold transition text-sm"
              >
                Click to Reset Password
              </a>
            </div>
          )}

          <button
            className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md hover:shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          <p className="text-sm text-slate-400">
            Remember your password?{" "}
            <span
              className="text-[#248232] font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
          <p className="text-sm text-slate-400">
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
