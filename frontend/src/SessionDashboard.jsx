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
  const [isPublicResults, setIsPublicResults] = useState(false);
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
      setIsPublicResults(!!data.publicResults);
      // Check if current user is owner
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsOwner(payload.userId === data.ownerId);
        } catch { }
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
      // If we don't have session yet, we can't check public results, but votes fetch might require auth if private
      // However, fetchSession is parallel. Let's just try fetching.
      // Ideally we wait for session to know if we need auth or if public is allowed.
      // But the backend handles the logic: if public, it returns; if private and auth, it returns.

      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/session/${sessionId}/votes`, { headers });

      if (res.ok) {
        setVotes(await res.json());
      }
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

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/candidate/${candidateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccess("Candidate deleted successfully");
        fetchCandidates();
        fetchVotes(); // Re-fetch votes as they might change
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete candidate");
      }
    } catch (err) {
      console.error("Error deleting candidate:", err);
      setError("Network error");
    }
  };

  const togglePublicResults = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const newValue = !isPublicResults;
      const res = await fetch(`${API_URL}/session/${sessionId}/settings/public`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ publicResults: newValue })
      });

      if (res.ok) {
        setIsPublicResults(newValue);
        setSuccess(newValue ? "Results are now public!" : "Results are now private.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update settings");
      }
    } catch (err) {
      console.error("Error toggling public results:", err);
      setError("Network error");
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#248232] mx-auto mb-4"></div>
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) return <div className="p-8 text-white">Session not found</div>;
  if (!isOwner) return null;

  const sessionLink = `${window.location.origin}/vote/${sessionId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">👑</span>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <h2 className="text-xl text-slate-400">{session.title}</h2>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg font-semibold hover:bg-slate-600 transition duration-200 border border-slate-600"
            >
              ← Home
            </button>
          </div>

          {/* Session Link */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-300 mb-2">📤 Share this link with participants:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionLink}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(sessionLink)}
                className="px-4 py-2 bg-[#248232] text-white rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md"
              >
                📋 Copy
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Session Code: <span className="font-mono font-bold text-slate-300">{sessionId}</span></p>
          </div>

          {/* Public Results Toggle */}
          <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg border border-slate-600">
            <span className="text-slate-300 font-medium">Publicize User Results:</span>
            <button
              onClick={togglePublicResults}
              className={`px-4 py-2 rounded-full font-bold transition duration-200 ${isPublicResults ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                }`}
            >
              {isPublicResults ? "ON" : "OFF"}
            </button>
            <span className="text-xs text-slate-500 ml-2">
              {isPublicResults ? "(Anyone with link can view)" : "(Only you can view)"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center border border-slate-700">
            <div className="text-4xl font-bold text-[#248232] mb-2">{totalVotes}</div>
            <p className="text-slate-400">Total Votes Cast</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center border border-slate-700">
            <div className="text-4xl font-bold text-[#248232] mb-2">{candidates.length}</div>
            <p className="text-slate-400">Candidates</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center border border-slate-700">
            <button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition duration-200 shadow-md hover:shadow-lg"
            >
              📊 View Live Results
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Candidate Form */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>➕</span> Add Candidate
            </h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-slate-300">Candidate Name</label>
                <input
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition placeholder-slate-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter candidate name"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-slate-300">Manifesto (Optional)</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition resize-none placeholder-slate-500"
                  value={manifesto}
                  onChange={e => setManifesto(e.target.value)}
                  placeholder="Enter candidate's manifesto or description"
                  rows="3"
                />
              </div>
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center">
                  <span className="mr-2">❌</span>
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg flex items-center">
                  <span className="mr-2">✅</span>
                  {success}
                </div>
              )}
              <button
                className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md hover:shadow-lg"
                type="submit"
              >
                Add Candidate
              </button>
            </form>
          </div>

          {/* Candidates List */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>👥</span> Candidates ({candidates.length})
            </h3>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🗳️</span>
                <p className="text-slate-400">No candidates yet. Add your first candidate!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {candidates.map((c, index) => (
                  <div key={c._id} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-[#248232] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{c.name}</h4>
                          {c.manifesto && (
                            <p className="text-sm text-slate-400 mt-1">{c.manifesto}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCandidate(c._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition"
                        title="Delete Candidate"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Results Preview */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl mt-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📈</span> Quick Results Preview
            </h3>
            <button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition duration-200 shadow-md"
            >
              View Full Results →
            </button>
          </div>
          {voteCounts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⏳</span>
              <p className="text-slate-400">No candidates yet</p>
            </div>
          ) : totalVotes === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⏳</span>
              <p className="text-slate-400">No votes cast yet. Share the session link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {voteCounts.slice(0, 5).map((c, i) => {
                const percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                return (
                  <div key={c._id} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-48 text-slate-200">
                      {i === 0 && c.votes > 0 && <span className="text-xl">👑</span>}
                      <span className="font-semibold truncate">{c.name}</span>
                    </div>
                    <div className="flex-1 bg-slate-700 rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
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
                <p className="text-center text-slate-500 text-sm mt-4">
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
