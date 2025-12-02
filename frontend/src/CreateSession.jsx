import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const CreateSession = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create a session.");
      return;
    }
    let userId;
    try {
      // Decode JWT to get userId
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.userId;
    } catch {
      setError("Invalid token. Please log in again.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/session/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, ownerId: userId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create session");
      } else {
        setSessionCode(data.code);
        setCreated(true);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <h2 className="text-3xl font-bold mb-8 text-white">Create a New Voting Session</h2>
      {!created ? (
        <form className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-300">Session Title</label>
            <input
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition placeholder-slate-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g. Student Council Election"
            />
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}
          <button className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-lg hover:shadow-green-900/20" type="submit">
            Create Session
          </button>
        </form>
      ) : (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-3xl font-bold text-[#248232] mb-2">Session Created Successfully!</h3>
            <p className="text-slate-400">Your voting session is ready to go</p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2 text-lg">
              <span>📋</span> Next Steps:
            </h4>
            <ol className="list-decimal list-inside space-y-3 text-blue-300">
              <li>Click the button below to go to your Admin Dashboard</li>
              <li>Add candidates for the voting session</li>
              <li>Share the participant link below with voters</li>
              <li>Monitor votes and view results in real-time</li>
            </ol>
          </div>

          {/* Admin Dashboard Button */}
          <button
            onClick={() => navigate(`/session/${sessionCode}`)}
            className="w-full bg-gradient-to-r from-[#248232] to-green-600 text-white py-4 rounded-lg font-bold text-xl mb-8 hover:from-green-600 hover:to-green-700 transition duration-200 shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-3"
          >
            <span>👑</span>
            Go to Admin Dashboard
            <span>→</span>
          </button>

          {/* Share Section */}
          <div className="border-t border-slate-700 pt-8">
            <h4 className="font-semibold text-slate-300 mb-4 flex items-center gap-2 text-lg">
              <span>📤</span> Share with Participants:
            </h4>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Participant Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.origin + "/vote/" + sessionCode}
                  readOnly
                  className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-600 text-slate-300 text-sm break-all focus:outline-none"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + "/vote/" + sessionCode);
                    alert("Link copied to clipboard!");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-200 flex-shrink-0 font-semibold shadow-md"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                Or share this session code:
                <span className="font-mono bg-slate-800 px-4 py-1 rounded border border-slate-600 font-bold text-[#248232] text-lg tracking-wider">
                  {sessionCode}
                </span>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-green-900/20 border border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-400">
              <span className="font-semibold">💡 Tip:</span> You can access your admin dashboard anytime from the home page by clicking on your session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSession;
