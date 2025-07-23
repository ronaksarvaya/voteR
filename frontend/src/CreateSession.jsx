import React, { useState } from "react";
import { API_URL } from "./config";

const CreateSession = () => {
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
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h3 className="text-xl font-semibold mb-2">Session Created!</h3>
          <p className="mb-2">Share this link with participants:</p>
          <div className="bg-gray-100 p-2 rounded mb-4 break-all">
            {window.location.origin + "/session/" + sessionCode}
          </div>
          <p className="text-gray-600">Or share this code: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{sessionCode}</span></p>
        </div>
      )}
    </div>
  );
};

export default CreateSession; 