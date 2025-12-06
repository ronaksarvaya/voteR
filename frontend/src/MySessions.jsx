import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const MySessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
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
                toast.error("Failed to load your sessions. Please try again.");
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
                toast.success("Session deleted successfully");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete session");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">My Voting Sessions</h1>
                    <Button
                        onClick={() => navigate("/create-session")}
                        className="font-semibold shadow-lg"
                    >
                        + Create New Session
                    </Button>
                </div>

                {sessions.length === 0 ? (
                    <Card className="shadow-xl text-center p-12">
                        <CardContent>
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">No Sessions Yet</h3>
                            <p className="text-muted-foreground mb-6">You haven't created any voting sessions yet.</p>
                            <Button
                                onClick={() => navigate("/create-session")}
                                className="font-semibold"
                            >
                                Create Your First Session
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {sessions.map((session) => (
                            <Card
                                key={session.code}
                                className="shadow-lg hover:border-primary transition duration-200 relative group"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-foreground mb-1">{session.title}</CardTitle>
                                            <CardDescription className="text-muted-foreground">
                                                Created on {new Date(session.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <span className="bg-muted text-primary px-3 py-1 rounded font-mono font-bold border border-border">
                                            {session.code}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate(`/session/${session.code}`)}
                                            className="gap-2"
                                        >
                                            <span>⚙️</span> Manage
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/results/${session.code}`)}
                                            className="text-primary border-primary/50 hover:bg-primary/10 gap-2"
                                        >
                                            <span>📊</span> Results
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDelete(session.code)}
                                            className="gap-2"
                                        >
                                            <span>🗑️</span> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button
                        variant="link"
                        onClick={() => navigate("/")}
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        ← Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MySessions;
