import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "./config";

console.log(API_URL);

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [votes, setVotes] = useState([]);
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("students");

  // Protect /admin route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Invalid token format");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resStudents = await fetch(`${API_URL}/admin/students`);
      const resVotes = await fetch(`${API_URL}/admin/votes`);
      const resPending = await fetch(`${API_URL}/admin/pending-candidates`);

      const dataStudents = await resStudents.json();
      const dataVotes = await resVotes.json();
      const dataPending = await resPending.json();

      setStudents(dataStudents);
      setVotes(dataVotes);
      setPendingCandidates(dataPending);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const handleApprove = async (collegeId) => {
    try {
      const res = await fetch(`${API_URL}/admin/approve-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId })
      });

      if (res.ok) {
        fetchData(); // Refresh data
      } else {
        alert("Failed to approve candidate");
      }
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aRegistered = !!a.registeredAs;
    const bRegistered = !!b.registeredAs;
    return aRegistered - bRegistered;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#30343F]">Admin Dashboard</h1>
      
      {/* Tab buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {["students", "votes", "candidates"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab
                ? "bg-[#248232] text-white"
                : "bg-white text-[#248232] border border-[#248232]"
            }`}
          >
            {tab === "students" ? "Students" : tab === "votes" ? "Votes" : "Pending Candidates"}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">All Students</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr
                  key={student["ID no"]}
                  className={student.registered ? "bg-green-100" : "bg-red-100"}
                >
                  <td className="px-4 py-2">{student["ID no"]}</td>
                  <td className="px-4 py-2">{student["Full Name"]}</td>
                  <td className="px-4 py-2">
                    {student.registeredAs ? student.registeredAs.toUpperCase() : "NOT REGISTERED"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Votes Tab */}
      {activeTab === "votes" && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Votes</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">Voter ID</th>
                <th className="px-4 py-2">Candidate ID</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{vote.voterId}</td>
                  <td className="px-4 py-2">{vote.candidateId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === "candidates" && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pending Candidate Approvals</h2>
          {pendingCandidates.length === 0 ? (
            <p className="text-gray-600">No pending approvals.</p>
          ) : (
            <ul className="space-y-2">
              {pendingCandidates.map((candidate) => (
                <li
                  key={candidate["ID no"]}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <span>{candidate["Full Name"]} ({candidate["ID no"]})</span>
                  <button
                    onClick={() => handleApprove(candidate["ID no"])}
                    className="bg-[#248232] text-white px-4 py-1 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
