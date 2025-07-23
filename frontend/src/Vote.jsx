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
      } catch {}
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

  if (loading) return <div className="p-8">Loading candidates...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Vote for a Candidate</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {voted ? (
          <div className="text-lg text-green-700 font-semibold">You have already voted in this session.</div>
        ) : (
          <ul>
            {candidates.map(c => (
              <li key={c._id} className="mb-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold">{c.name}</span>
                  {c.manifesto && <span className="text-gray-600 ml-2">({c.manifesto})</span>}
                </div>
                <button className="bg-[#248232] text-white px-4 py-2 rounded" onClick={() => handleVote(c._id)}>
                  Vote
                </button>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded w-full" onClick={() => window.location.href = `/results/${sessionId}`}>View Live Results</button>
      </div>
    </div>
  );
};

export default Vote; 