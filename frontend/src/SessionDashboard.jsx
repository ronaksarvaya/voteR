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
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
    fetchCandidates();
    fetchVotes();
  }, [sessionId]);

  useEffect(() => {
    if (session && !isOwner) {
      navigate(`/vote/${sessionId}`);
    }
  }, [session, isOwner, sessionId, navigate]);

  const fetchSession = async () => {
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
  };

  const fetchCandidates = async () => {
    const res = await fetch(`${API_URL}/session/${sessionId}/candidates`);
    if (res.ok) setCandidates(await res.json());
  };

  const fetchVotes = async () => {
    const res = await fetch(`${API_URL}/session/${sessionId}/votes`);
    if (res.ok) setVotes(await res.json());
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
        setSuccess("Candidate added");
        setName(""); setManifesto("");
        fetchCandidates();
      }
    } catch { setError("Network error"); }
  };

  // Tally votes per candidate
  const voteCounts = candidates.map(c => ({
    ...c,
    votes: votes.filter(v => v.candidateId === c._id).length
  })).sort((a, b) => b.votes - a.votes);

  if (!session) return <div className="p-8">Loading session...</div>;
  if (!isOwner) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Session: {session.title}</h2>
      {isOwner ? (
        <>
          <form className="bg-white p-4 rounded shadow mb-6 max-w-lg" onSubmit={handleAddCandidate}>
            <h3 className="text-lg font-semibold mb-2">Add Candidate</h3>
            <div className="mb-2">
              <input className="border rounded px-3 py-2 w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Candidate Name" required />
            </div>
            <div className="mb-2">
              <textarea className="border rounded px-3 py-2 w-full" value={manifesto} onChange={e => setManifesto(e.target.value)} placeholder="Manifesto (optional)" />
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <button className="bg-[#248232] text-white px-4 py-2 rounded" type="submit">Add Candidate</button>
          </form>
          <div className="bg-white p-4 rounded shadow mb-6 max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Candidates</h3>
            <ul>
              {candidates.map(c => (
                <li key={c._id} className="mb-2">
                  <span className="font-semibold">{c.name}</span>
                  {c.manifesto && <span className="text-gray-600 ml-2">({c.manifesto})</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Results</h3>
            <ul>
              {voteCounts.map(c => (
                <li key={c._id} className="mb-2 flex justify-between">
                  <span>{c.name}</span>
                  <span className="font-mono">{c.votes} votes</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="bg-white p-4 rounded shadow max-w-lg">
          <h3 className="text-lg font-semibold mb-2">Candidates</h3>
          <ul>
            {candidates.map(c => (
              <li key={c._id} className="mb-2">
                <span className="font-semibold">{c.name}</span>
                {c.manifesto && <span className="text-gray-600 ml-2">({c.manifesto})</span>}
              </li>
            ))}
          </ul>
          <button className="mt-4 bg-[#248232] text-white px-4 py-2 rounded" onClick={() => navigate(`/vote/${sessionId}`)}>
            Go to Voting Page
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionDashboard; 