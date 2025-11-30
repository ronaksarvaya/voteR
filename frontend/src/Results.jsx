import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");

  useEffect(() => {
    verifyOwnerAndFetchData();
  }, [sessionId]);

  const verifyOwnerAndFetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // First, verify if user is the owner
      const verifyRes = await fetch(`${API_URL}/session/${sessionId}/verify-owner`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!verifyRes.ok) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const verifyData = await verifyRes.json();
      
      if (!verifyData.isOwner) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setIsOwner(true);

      // Fetch session details
      const sessionRes = await fetch(`${API_URL}/session/${sessionId}`);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSessionTitle(sessionData.title);
      }

      // Fetch candidates and votes
      const resC = await fetch(`${API_URL}/session/${sessionId}/candidates`);
      const resV = await fetch(`${API_URL}/session/${sessionId}/votes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resC.ok) setCandidates(await resC.json());
      if (resV.ok) {
        setVotes(await resV.json());
      } else {
        const errorData = await resV.json();
        console.error("Error fetching votes:", errorData.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  // Tally votes per candidate
  const voteCounts = candidates.map(c => ({
    ...c,
    votes: votes.filter(v => v.candidateId === c._id).length
  })).sort((a, b) => b.votes - a.votes);

  const totalVotes = votes.length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#248232]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-semibold text-gray-700">Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only the session creator can view the results. If you're a participant, please wait for the creator to share the results.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(`/vote/${sessionId}`)}
              className="flex-1 px-4 py-3 bg-[#248232] text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#30343F] mb-2">
                📊 Session Results
              </h1>
              {sessionTitle && (
                <p className="text-lg text-gray-600">{sessionTitle}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/session/${sessionId}`)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-[#248232]">{totalVotes}</div>
              <p className="text-gray-600 text-sm">Total Votes</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#248232]">{candidates.length}</div>
              <p className="text-gray-600 text-sm">Candidates</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#248232]">
                {voteCounts.length > 0 && voteCounts[0].votes > 0 ? "🏆" : "⏳"}
              </div>
              <p className="text-gray-600 text-sm">Status</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-[#30343F] mb-6">Vote Distribution</h2>
          
          {voteCounts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🗳️</span>
              <p className="text-gray-600 text-lg">No candidates yet. Add candidates to start voting!</p>
            </div>
          ) : totalVotes === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⏳</span>
              <p className="text-gray-600 text-lg">No votes cast yet. Share the session link to start voting!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voteCounts.map((c, i) => {
                const percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                return (
                  <div key={c._id} className="border rounded-xl p-4 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        {i === 0 && c.votes > 0 && (
                          <span className="text-2xl">👑</span>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-[#30343F]">{c.name}</h3>
                          {c.manifesto && (
                            <p className="text-sm text-gray-600">{c.manifesto}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#248232]">{c.votes}</div>
                        <div className="text-sm text-gray-600">{percentage}%</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Tip: Refresh the page to see updated results in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
