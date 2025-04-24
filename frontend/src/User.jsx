"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "./config"

const User = () => {
  const [fullname, setFullname] = useState("")
  const [roleToRegister, setRoleToRegister] = useState(null)
  const [manifesto, setManifesto] = useState("")
  const [registrationMessage, setRegistrationMessage] = useState("")
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("")
  const [approved, setApproved] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [votingStatus, setVotingStatus] = useState({ hasVoted: false, message: "" })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem("token")
          navigate("/login", { replace: true })
          return
        }

        const data = await response.json()
        setFullname(data.fullName)

        const idNo = JSON.parse(atob(token.split(".")[1])).collegeId
        const regRes = await fetch(`${API_URL}/register/${idNo}`)
        const regData = await regRes.json()

        setRegistered(regData.registered === true)
        setRole(regData.role)
        setApproved(regData.approved || false)

        if (regData.registered === true) {
          // Check if user has already voted
          const votesRes = await fetch(`${API_URL}/admin/votes`)
          const votes = await votesRes.json()
          const hasVoted = votes.some((vote) => vote.voterId === Number.parseInt(idNo))
          setVotingStatus({ hasVoted, message: hasVoted ? "You have already voted." : "" })

          // Fetch candidates regardless of role to display them
          const candidateRes = await fetch(`${API_URL}/candidates`)
          const candidateList = await candidateRes.json()
          setCandidates(candidateList)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        localStorage.removeItem("token")
        navigate("/login", { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }

  const handleRegister = async (role) => {
    const token = localStorage.getItem("token")
    const payload = JSON.parse(atob(token.split(".")[1]))
    const idNo = payload.collegeId

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idNo,
          role,
          manifesto: role === "candidate" ? manifesto : undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setRegistrationMessage(data.error || "Registration failed.")
      } else {
        setRegistrationMessage(`Successfully registered as ${role}`)
        setRoleToRegister(null)
        setManifesto("")

        // Fetch candidates after registration
        const candidateRes = await fetch(`${API_URL}/candidates`)
        const candidateList = await candidateRes.json()
        setCandidates(candidateList)
        setRegistered(true)
        setRole(role)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setRegistrationMessage("Something went wrong.")
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      setVotingStatus({ ...votingStatus, message: "Please select a candidate first." })
      return
    }

    const token = localStorage.getItem("token")
    const payload = JSON.parse(atob(token.split(".")[1]))
    const voterId = payload.collegeId

    try {
      const response = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId,
          candidateId: selectedCandidate,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setVotingStatus({ hasVoted: false, message: data.error || "Voting failed." })
      } else {
        setVotingStatus({ hasVoted: true, message: "Your vote has been recorded successfully!" })
        setSelectedCandidate(null)
      }
    } catch (err) {
      console.error("Voting error:", err)
      setVotingStatus({ ...votingStatus, message: "Something went wrong while voting." })
    }
  }

  if (loading) {
    return <p className="text-center text-lg mt-10">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-[#C5E6A6] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#30343F]">Hello, {fullname}</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {registered ? (
        <div className="text-center text-lg text-green-800 font-medium">
          <p className="mb-2">
            ✅ You have already registered as <strong>{role}</strong>.
          </p>

          {role === "voter" && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-[#248232]">Candidate List</h2>
              {votingStatus.message && (
                <p
                  className={`text-center mb-4 font-medium ${votingStatus.hasVoted ? "text-green-600" : "text-red-600"}`}
                >
                  {votingStatus.message}
                </p>
              )}

              {candidates.length > 0 ? (
                <div className="space-y-4">
                  {!votingStatus.hasVoted && (
                    <p className="text-blue-700 mb-2">Select a candidate and click "Vote" to cast your vote.</p>
                  )}

                  <ul className="space-y-2">
                    {candidates.map((c) => (
                      <li
                        key={c["ID no"]}
                        className={`bg-white p-4 rounded-lg shadow-md ${
                          selectedCandidate === c["ID no"] ? "border-2 border-[#248232]" : ""
                        } ${votingStatus.hasVoted ? "cursor-default" : "cursor-pointer"}`}
                        onClick={() => !votingStatus.hasVoted && setSelectedCandidate(c["ID no"])}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-semibold">{c["Full Name"]}</p>
                            <p className="text-sm text-gray-600">{c.manifesto}</p>
                          </div>
                          {!votingStatus.hasVoted && (
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="candidate"
                                checked={selectedCandidate === c["ID no"]}
                                onChange={() => setSelectedCandidate(c["ID no"])}
                                className="mr-2 h-4 w-4 text-[#248232]"
                              />
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {!votingStatus.hasVoted && (
                    <button
                      onClick={handleVote}
                      disabled={!selectedCandidate}
                      className={`mt-4 px-6 py-2 rounded-lg text-white font-medium ${
                        selectedCandidate ? "bg-[#248232] hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Cast Your Vote
                    </button>
                  )}
                </div>
              ) : (
                <p>No candidates available yet.</p>
              )}
            </div>
          )}

          {role === "candidate" && (
            <div className="mt-4">
              <p className="text-lg">
                Approval Status:{" "}
                <span className={approved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {approved ? "Approved ✅" : "Pending ❌"}
                </span>
              </p>
              {approved && <p className="mt-2">🎉 You are approved. All the best for the elections!</p>}

              {/* Show other candidates even to candidates */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 text-[#248232]">Other Candidates</h2>
                {candidates.filter(
                  (c) =>
                    c["ID no"] !==
                    Number.parseInt(JSON.parse(atob(localStorage.getItem("token").split(".")[1])).collegeId),
                ).length > 0 ? (
                  <ul className="space-y-2">
                    {candidates
                      .filter(
                        (c) =>
                          c["ID no"] !==
                          Number.parseInt(JSON.parse(atob(localStorage.getItem("token").split(".")[1])).collegeId),
                      )
                      .map((c) => (
                        <li key={c["ID no"]} className="bg-white p-4 rounded-lg shadow-md">
                          <p className="text-lg font-semibold">{c["Full Name"]}</p>
                          <p className="text-sm text-gray-600">{c.manifesto}</p>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No other candidates available yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => setRoleToRegister("candidate")}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-[#248232] mb-2">Register as a Candidate</h2>
              <p className="text-gray-700">Want to be a CR? Click here to start your nomination.</p>
            </div>

            <div
              onClick={() => handleRegister("voter")}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-[#248232] mb-2">Register as a Voter</h2>
              <p className="text-gray-700">Prefer to vote for a CR? Register here to cast your vote.</p>
            </div>
          </div>

          {roleToRegister === "candidate" && (
            <div className="mt-6 max-w-xl mx-auto bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-[#248232] mb-2">Submit Your Manifesto</h3>
              <textarea
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                placeholder="Enter your manifesto here"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                rows={4}
              />
              <button
                onClick={() => handleRegister("candidate")}
                className="bg-[#248232] text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          )}
        </>
      )}

      {registrationMessage && <p className="text-green-700 font-medium mt-6 text-center">{registrationMessage}</p>}
    </div>
  )
}

export default User
