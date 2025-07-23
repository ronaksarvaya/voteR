import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "./config";

const Results = () => {
  const { sessionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [sessionId]);

  const fetchAll = async () => {
    setLoading(true);
    const resC = await fetch(`${API_URL}/session/${sessionId}/candidates`);
    const resV = await fetch(`${API_URL}/session/${sessionId}/votes`);
    if (resC.ok) setCandidates(await resC.json());
    if (resV.ok) setVotes(await resV.json());
    setLoading(false);
  };

  // Tally votes per candidate
  const voteCounts = candidates.map(c => ({
    ...c,
    votes: votes.filter(v => v.candidateId === c._id).length
  })).sort((a, b) => b.votes - a.votes);

  if (loading) return <div className="p-8">Loading results...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Session Results</h2>
        <ul>
          {voteCounts.map((c, i) => (
            <li key={c._id} className="mb-4 flex justify-between items-center">
              <div>
                {i === 0 && c.votes > 0 && <span className="text-yellow-500 mr-2">👑</span>}
                <span className="font-semibold">{c.name}</span>
                {c.manifesto && <span className="text-gray-600 ml-2">({c.manifesto})</span>}
              </div>
              <span className="font-mono">{c.votes} votes</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Results; 