import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "./config";

const Vote = () => {
  const { sessionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
    checkIfVoted();
  }, [sessionId]);

  const fetchCandidates = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/session/${sessionId}/candidates`);
    if (res.ok) setCandidates(await res.json());
    setLoading(false);
  };

  const checkIfVoted = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_URL}/session/${sessionId}/votes`);
    if (res.ok) {
      const votes = await res.json();
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (votes.some(v => v.userId === payload.userId)) setVoted(true);
      } catch { }
    }
  };

  const handleVote = async (candidateId) => {
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) { setError("Not logged in"); return; }
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidateId })
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to vote");
      else {
        setSuccess("Vote recorded! Thank you.");
        setVoted(true);
      }
    } catch { setError("Network error"); }
  };

  if (loading) return <div className="p-8 text-white">Loading candidates...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Vote for a Candidate</h2>
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg mb-4 flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}
        {voted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-xl text-green-400 font-semibold mb-2">Vote Recorded!</div>
            <p className="text-slate-400">You have already voted in this session.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {candidates.map(c => (
              <li key={c._id} className="bg-slate-900 border border-slate-600 rounded-lg p-4 flex justify-between items-center hover:border-[#248232] transition duration-200">
                <div>
                  <span className="font-bold text-white text-lg block">{c.name}</span>
                  {c.manifesto && <span className="text-slate-400 text-sm">{c.manifesto}</span>}
                </div>
                <button
                  className="bg-[#248232] text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
                  onClick={() => handleVote(c._id)}
                >
                  Vote
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          className="mt-8 w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-500 transition shadow-lg"
          onClick={() => window.location.href = `/results/${sessionId}`}
        >
          View Live Results
        </button>
      </div>
    </div>
  );
};

export default Vote;