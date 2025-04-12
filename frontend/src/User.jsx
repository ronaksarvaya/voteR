import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const User = () => {
  const [fullname, setFullname] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true }); // prevent back nav
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true }); // force logout if token is bad
          return;
        }

        const data = await response.json();
        setFullname(data.fullName);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true }); // replace history so back button doesn't return to home
  };

  return (
    <div className="min-h-screen bg-[#C5E6A6] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#30343F]">
          Hello, {fullname}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg cursor-pointer">
          <h2 className="text-xl font-semibold text-[#248232] mb-2">
            Register as a Candidate
          </h2>
          <p className="text-gray-700">
            Want to be a CR? Click here to start your nomination.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg cursor-pointer">
          <h2 className="text-xl font-semibold text-[#248232] mb-2">
            Register as a Voter
          </h2>
          <p className="text-gray-700">
            Prefer to vote for a CR? Register here to cast your vote.
          </p>
        </div>
      </div>
    </div>
  );
};

export default User;
