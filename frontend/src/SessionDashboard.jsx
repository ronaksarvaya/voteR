import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const SessionDashboard = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [name, setName] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
    fetchCandidates();
    fetchVotes();
  }, [sessionId]);

  useEffect(() => {
    if (session && !isOwner && !loading) {
      navigate(`/vote/${sessionId}`);
    }
  }, [session, isOwner, sessionId, navigate, loading]);

  const fetchSession = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/session/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data);
      // Check if current user is owner
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsOwner(payload.userId === data.ownerId);
        } catch {}
      }
    }
    setLoading(false);
  };

  const fetchCandidates = async () => {
    const res = await fetch(`${API_URL}/session/${sessionId}/candidates`);
    if (res.ok) setCandidates(await res.json());
  };

  const fetchVotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/votes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setVotes(await res.json());
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) { setError("Not logged in"); return; }
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, manifesto })
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to add candidate");
      else {
        setSuccess("Candidate added successfully!");
        setName(""); setManifesto("");
        fetchCandidates();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { setError("Network error"); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Tally votes per candidate
  const voteCounts = candidates.map(c => ({
    ...c,
    votes: votes.filter(v => v.candidateId === c._id).length
  })).sort((a, b) => b.votes - a.votes);

  const totalVotes = votes.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#248232] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) return <div className="p-8">Session not found</div>;
  if (!isOwner) return null;

  const sessionLink = `${window.location.origin}/vote/${sessionId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">👑</span>
                <h1 className="text-3xl font-bold text-[#30343F]">Admin Dashboard</h1>
              </div>
              <h2 className="text-xl text-gray-600">{session.title}</h2>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              ← Home
            </button>
          </div>

          {/* Session Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">📤 Share this link with participants:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(sessionLink)}
                className="px-4 py-2 bg-[#248232] text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200"
              >
                📋 Copy
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Session Code: <span className="font-mono font-bold">{sessionId}</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl font-bold text-[#248232] mb-2">{totalVotes}</div>
            <p className="text-gray-600">Total Votes Cast</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl font-bold text-[#248232] mb-2">{candidates.length}</div>
            <p className="text-gray-600">Candidates</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow-md hover:shadow-lg"
            >
              📊 View Live Results
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Candidate Form */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold text-[#30343F] mb-4 flex items-center gap-2">
              <span>➕</span> Add Candidate
            </h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Candidate Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter candidate name"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Manifesto (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition resize-none"
                  value={manifesto}
                  onChange={e => setManifesto(e.target.value)}
                  placeholder="Enter candidate's manifesto or description"
                  rows="3"
                />
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
                className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg"
                type="submit"
              >
                Add Candidate
              </button>
            </form>
          </div>

          {/* Candidates List */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold text-[#30343F] mb-4 flex items-center gap-2">
              <span>👥</span> Candidates ({candidates.length})
            </h3>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🗳️</span>
                <p className="text-gray-600">No candidates yet. Add your first candidate!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidates.map((c, index) => (
                  <div key={c._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#248232] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#30343F]">{c.name}</h4>
                        {c.manifesto && (
                          <p className="text-sm text-gray-600 mt-1">{c.manifesto}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Results Preview */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#30343F] flex items-center gap-2">
              <span>📈</span> Quick Results Preview
            </h3>
            <button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
            >
              View Full Results →
            </button>
          </div>
          {voteCounts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⏳</span>
              <p className="text-gray-600">No candidates yet</p>
            </div>
          ) : totalVotes === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⏳</span>
              <p className="text-gray-600">No votes cast yet. Share the session link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {voteCounts.slice(0, 5).map((c, i) => {
                const percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                return (
                  <div key={c._id} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-48">
                      {i === 0 && c.votes > 0 && <span className="text-xl">👑</span>}
                      <span className="font-semibold truncate">{c.name}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-white text-xs font-bold">{percentage}%</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#248232] w-16 text-right">{c.votes}</span>
                  </div>
                );
              })}
              {voteCounts.length > 5 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  + {voteCounts.length - 5} more candidates
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDashboard;
