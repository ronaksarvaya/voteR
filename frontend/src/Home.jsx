import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header with Logout */}
      <div className="absolute top-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
            <span className="text-5xl">🗳️</span>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to VoteR
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Create secure voting sessions, gather opinions, and see real-time results. 
            Democracy made simple and accessible for everyone.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Create Session Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-[#30343F] mb-3">Create Session</h2>
            <p className="text-gray-600 mb-6">
              Start a new voting session with custom options. Perfect for polls, surveys, and decision-making.
            </p>
            <button
              onClick={() => navigate("/create-session")}
              className="w-full px-6 py-4 bg-[#248232] text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>➕</span>
              Create Voting Session
            </button>
          </div>

          {/* Join Session Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-[#30343F] mb-3">Join Session</h2>
            <p className="text-gray-600 mb-6">
              Enter a session code to participate in an active voting session and cast your vote.
            </p>
            <button
              onClick={() => navigate("/join-session")}
              className="w-full px-6 py-4 bg-white text-[#248232] border-2 border-[#248232] rounded-lg text-lg font-semibold hover:bg-green-50 transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>🔗</span>
              Join Voting Session
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#30343F] mb-10">
            Why Choose VoteR?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-[#30343F] mb-2">Real-Time Results</h4>
              <p className="text-gray-600">
                See voting results update instantly as participants cast their votes
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-xl font-bold text-[#30343F] mb-2">Secure & Private</h4>
              <p className="text-gray-600">
                Your votes are encrypted and secure with our robust authentication system
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="text-xl font-bold text-[#30343F] mb-2">Easy to Use</h4>
              <p className="text-gray-600">
                Simple interface that anyone can use without technical knowledge
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#248232] mb-2">Fast</div>
              <p className="text-gray-600">Quick Setup</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#248232] mb-2">Secure</div>
              <p className="text-gray-600">Protected Votes</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#248232] mb-2">Simple</div>
              <p className="text-gray-600">Easy Interface</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
