import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const MySessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/session/my-sessions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        navigate("/login");
                        return;
                    }
                    throw new Error("Failed to fetch sessions");
                }

                const data = await res.json();
                setSessions(data);
            } catch (err) {
                setError("Failed to load your sessions. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [navigate]);

    const handleDelete = async (code) => {
        if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/session/${code}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setSessions(sessions.filter((s) => s.code !== code));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete session");
            }
        } catch (err) {
            alert("Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#248232]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">My Voting Sessions</h1>
                    <Link
                        to="/create-session"
                        className="bg-[#248232] hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-green-900/20"
                    >
                        + Create New Session
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {sessions.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700 shadow-xl">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
                        <p className="text-slate-400 mb-6">You haven't created any voting sessions yet.</p>
                        <Link
                            to="/create-session"
                            className="inline-block bg-[#248232] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
                        >
                            Create Your First Session
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {sessions.map((session) => (
                            <div
                                key={session.code}
                                className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:border-[#248232] transition duration-200 relative group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{session.title}</h3>
                                        <p className="text-sm text-slate-400">
                                            Created on {new Date(session.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="bg-slate-900 text-[#248232] px-3 py-1 rounded font-mono font-bold border border-slate-600">
                                        {session.code}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <Link
                                        to={`/session/${session.code}`}
                                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition duration-200 font-medium"
                                    >
                                        <span>⚙️</span> Manage
                                    </Link>
                                    <Link
                                        to={`/results/${session.code}`}
                                        className="flex items-center justify-center gap-2 bg-[#248232]/20 hover:bg-[#248232]/30 text-[#248232] border border-[#248232]/50 py-2 rounded-lg transition duration-200 font-medium"
                                    >
                                        <span>📊</span> Results
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(session.code)}
                                        className="flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded-lg transition duration-200 font-medium"
                                    >
                                        <span>🗑️</span> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link to="/" className="text-slate-400 hover:text-white transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MySessions;
