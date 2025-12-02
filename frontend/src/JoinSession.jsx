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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <h2 className="text-3xl font-bold mb-8 text-white">Join a Voting Session</h2>
      <form className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-slate-300">Session Code or Link</label>
          <input
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#248232] focus:border-transparent transition placeholder-slate-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            required
            placeholder="Enter session code or link"
          />
        </div>
        <button className="w-full bg-[#248232] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-lg hover:shadow-green-900/20" type="submit">
          Join Session
        </button>
      </form>
    </div>
  );
};

export default JoinSession;