import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Building,
  Calendar,
  Bookmark,
  Link as LinkIcon,
  FileText,
  Mail,
} from "lucide-react";
import "../styles/SentRequests.css";

const SentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(`${baseUrl}/api/v1/btp-requests/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setError("Failed to fetch sent requests. Please try again.");
      setLoading(false);
    }
  };

  const filterRequestsByStatus = (status) => {
    return requests.filter((request) => request.status === status);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-badge status-pending";
      case "accepted":
        return "status-badge status-accepted";
      case "rejected":
        return "status-badge status-rejected";
      default:
        return "status-badge";
    }
  };

  return (
    <>
      <Navbar />
      <div className="sent-requests-container">
        <h1>Sent BTP Requests</h1>

        <div className="tabs">
          <button
            onClick={() => setActiveTab("pending")}
            className={activeTab === "pending" ? "active" : ""}
          >
            <Clock size={18} />
            Pending
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={activeTab === "accepted" ? "active" : ""}
          >
            <CheckCircle size={18} />
            Accepted
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={activeTab === "rejected" ? "active" : ""}
          >
            <XCircle size={18} />
            Rejected
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="requests-grid">
            {filterRequestsByStatus(activeTab).map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
                <div className="request-body">
                  <div className="info-row">
                    <User size={20} />
                    <strong>Faculty Name:</strong>
                    <span>{request.facultyName}</span>
                  </div>
                  <div className="info-row email-row">
                    <Mail size={20} />
                    <strong>Faculty Email:</strong>
                    <span>{request.facultyEmail}</span>
                  </div>
                  <div className="info-row">
                    <Building size={20} />
                    <strong>Department:</strong>
                    <span>{request.Teacher?.department}</span>
                  </div>
                  <div className="info-row">
                    <Calendar size={20} />
                    <strong>Sent Date:</strong>
                    <span>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <LinkIcon size={20} />
                    <strong>Resume:</strong>
                    <a
                      href={request.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Resume
                    </a>
                  </div>
                  {request.projectIdea && (
                    <div className="info-row project-idea">
                      <strong>
                        <FileText size={20} />
                        Project Idea:
                      </strong>
                      <span>{request.projectIdea}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          filterRequestsByStatus(activeTab).length === 0 && (
            <div className="no-requests">
              <Bookmark size={48} />
              <p>No {activeTab} requests found</p>
            </div>
          )}
      </div>
    </>
  );
};

export default SentRequests;
