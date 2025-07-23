import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinSession = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Extract code from input (if it's a link, get the last part)
    let code = input.trim();
    if (code.includes("/")) {
      code = code.split("/").pop();
    }
    // TODO: Validate code with backend
    navigate(`/session/${code}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Join a Voting Session</h2>
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Session Code or Link</label>
          <input className="w-full border rounded px-3 py-2" value={input} onChange={e => setInput(e.target.value)} required placeholder="Enter session code or link" />
        </div>
        <button className="w-full bg-[#248232] text-white py-2 rounded-lg font-semibold" type="submit">
          Join Session
        </button>
      </form>
    </div>
  );
};

export default JoinSession; 