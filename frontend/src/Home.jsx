import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-[#30343F]">Welcome to VoteR</h1>
      <div className="flex gap-6">
        <button
          className="px-6 py-3 bg-[#248232] text-white rounded-lg text-lg font-semibold hover:bg-green-700"
          onClick={() => navigate("/create-session")}
        >
          Create Voting Session
        </button>
        <button
          className="px-6 py-3 bg-white text-[#248232] border border-[#248232] rounded-lg text-lg font-semibold hover:bg-green-100"
          onClick={() => navigate("/join-session")}
        >
          Join Voting Session
        </button>
      </div>
    </div>
  );
};

export default Home; 