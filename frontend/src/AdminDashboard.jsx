"use client"

import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { API_URL } from "./config"

console.log(API_URL)

const AdminDashboard = () => {
  const [students, setStudents] = useState([])
  const [votes, setVotes] = useState([])
  const [pendingCandidates, setPendingCandidates] = useState([])
  const [activeTab, setActiveTab] = useState("students")
  const [voteStats, setVoteStats] = useState([])
  const [totalVotes, setTotalVotes] = useState(0)

  // Protect /admin route
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const decoded = jwtDecode(token)
      if (decoded.role !== "admin") {
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Invalid token format")
      window.location.href = "/login"
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const resStudents = await fetch(`${API_URL}/admin/students`)
      const resVotes = await fetch(`${API_URL}/admin/votes`)
      const resPending = await fetch(`${API_URL}/admin/pending-candidates`)

      const dataStudents = await resStudents.json()
      const dataVotes = await resVotes.json()
      const dataPending = await resPending.json()

      setStudents(dataStudents)
      setVotes(dataVotes)
      setPendingCandidates(dataPending)

      // Calculate vote statistics
      const candidates = dataStudents.filter((s) => s.role === "candidate" && s.approved === true)
      const voteCount = {}

      // Initialize vote count for each candidate
      candidates.forEach((c) => {
        voteCount[c["ID no"]] = {
          count: 0,
          name: c["Full Name"],
          manifesto: c.manifesto || "",
        }
      })

      // Count votes for each candidate
      dataVotes.forEach((vote) => {
        if (voteCount[vote.candidateId]) {
          voteCount[vote.candidateId].count++
        }
      })

      // Convert to array and sort by vote count
      const stats = Object.entries(voteCount)
        .map(([id, data]) => ({
          id: Number(id),
          name: data.name,
          manifesto: data.manifesto,
          votes: data.count,
          percentage: dataVotes.length > 0 ? Math.round((data.count / dataVotes.length) * 100) : 0,
        }))
        .sort((a, b) => b.votes - a.votes)

      setVoteStats(stats)
      setTotalVotes(dataVotes.length)
    } catch (err) {
      console.error("Error fetching admin data:", err)
    }
  }

  const handleApprove = async (collegeId) => {
    try {
      const res = await fetch(`${API_URL}/admin/approve-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      })

      if (res.ok) {
        fetchData() // Refresh data
      } else {
        alert("Failed to approve candidate")
      }
    } catch (err) {
      console.error("Approve error:", err)
    }
  }

  const sortedStudents = [...students].sort((a, b) => {
    const aRegistered = !!a.registered
    const bRegistered = !!b.registered
    return aRegistered - bRegistered
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-white">Admin Dashboard</h1>

      {/* Tab buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {["students", "votes", "candidates", "results"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition duration-200 ${activeTab === tab ? "bg-[#248232] text-white" : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
              }`}
          >
            {tab === "students"
              ? "Students"
              : tab === "votes"
                ? "Votes"
                : tab === "candidates"
                  ? "Pending Candidates"
                  : "Election Results"}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">All Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-slate-300">
              <thead>
                <tr className="bg-slate-700 text-left">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => (
                  <tr key={student["ID no"]} className={`border-b border-slate-700 ${student.registered ? "bg-green-900/20" : "bg-red-900/20"}`}>
                    <td className="px-4 py-2">{student["ID no"]}</td>
                    <td className="px-4 py-2">{student["Full Name"]}</td>
                    <td className="px-4 py-2">{student.registered ? "REGISTERED" : "NOT REGISTERED"}</td>
                    <td className="px-4 py-2">{student.role || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Votes Tab */}
      {activeTab === "votes" && (
        <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Votes</h2>
          <p className="mb-4 text-slate-300">
            Total votes cast: <span className="font-bold text-white">{votes.length}</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-slate-300">
              <thead>
                <tr className="bg-slate-700 text-left">
                  <th className="px-4 py-2">Voter ID</th>
                  <th className="px-4 py-2">Voter Name</th>
                  <th className="px-4 py-2">Candidate ID</th>
                  <th className="px-4 py-2">Candidate Name</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote, i) => {
                  const voter = students.find((s) => s["ID no"] === vote.voterId)
                  const candidate = students.find((s) => s["ID no"] === vote.candidateId)
                  return (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-2">{vote.voterId}</td>
                      <td className="px-4 py-2">{voter ? voter["Full Name"] : "Unknown"}</td>
                      <td className="px-4 py-2">{vote.candidateId}</td>
                      <td className="px-4 py-2">{candidate ? candidate["Full Name"] : "Unknown"}</td>
                      <td className="px-4 py-2">{vote.timestamp ? new Date(vote.timestamp).toLocaleString() : "N/A"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === "candidates" && (
        <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Pending Candidate Approvals</h2>
          {pendingCandidates.length === 0 ? (
            <p className="text-slate-400">No pending approvals.</p>
          ) : (
            <ul className="space-y-2">
              {pendingCandidates.map((candidate) => (
                <li key={candidate["ID no"]} className="flex justify-between items-center border border-slate-600 p-3 rounded-lg bg-slate-900">
                  <div>
                    <span className="font-medium text-white">
                      {candidate["Full Name"]} ({candidate["ID no"]})
                    </span>
                    {candidate.manifesto && (
                      <p className="text-sm text-slate-400 mt-1">Manifesto: {candidate.manifesto}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApprove(candidate["ID no"])}
                    className="bg-[#248232] text-white px-4 py-1 rounded-lg hover:bg-green-600 transition duration-200"
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Election Results</h2>
          <p className="mb-4 text-slate-300">
            Total votes cast: <span className="font-bold text-white">{totalVotes}</span>
          </p>

          {voteStats.length === 0 ? (
            <p className="text-slate-400">No votes have been cast yet.</p>
          ) : (
            <div className="space-y-6">
              {voteStats.map((candidate, index) => (
                <div key={candidate.id} className="border border-slate-600 rounded-lg p-4 bg-slate-900">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {index === 0 && totalVotes > 0 && <span className="text-yellow-500 mr-2">👑</span>}
                      {candidate.name}
                    </h3>
                    <span className="font-bold text-lg text-[#248232]">
                      {candidate.votes} votes ({candidate.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500" style={{ width: `${candidate.percentage}%` }}></div>
                  </div>

                  {candidate.manifesto && (
                    <p className="text-sm text-slate-400 mt-2">Manifesto: {candidate.manifesto}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
