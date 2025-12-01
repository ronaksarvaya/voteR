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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Create a New Voting Session</h2>
      {!created ? (
        <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Session Title</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Student Council Election" />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button className="w-full bg-[#248232] text-white py-2 rounded-lg font-semibold" type="submit">
            Create Session
          </button>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-[#248232] mb-2">Session Created Successfully!</h3>
            <p className="text-gray-600">Your voting session is ready to go</p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>📋</span> Next Steps:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Click the button below to go to your Admin Dashboard</li>
              <li>Add candidates for the voting session</li>
              <li>Share the participant link below with voters</li>
              <li>Monitor votes and view results in real-time</li>
            </ol>
          </div>

          {/* Admin Dashboard Button */}
          <button
            onClick={() => navigate(`/session/${sessionCode}`)}
            className="w-full bg-gradient-to-r from-[#248232] to-green-600 text-white py-4 rounded-lg font-bold text-lg mb-6 hover:from-green-700 hover:to-green-800 transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>👑</span>
            Go to Admin Dashboard
            <span>→</span>
          </button>

          {/* Share Section */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>📤</span> Share with Participants:
            </h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Participant Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.origin + "/vote/" + sessionCode}
                  readOnly
                  className="flex-1 bg-gray-100 p-3 rounded border border-gray-300 text-sm break-all"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + "/vote/" + sessionCode);
                    alert("Link copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 flex-shrink-0"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Or share this session code: 
                <span className="font-mono bg-white px-3 py-1 rounded border border-gray-300 ml-2 font-bold text-[#248232]">
                  {sessionCode}
                </span>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="font-semibold">💡 Tip:</span> You can access your admin dashboard anytime from the home page by clicking on your session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSession;
