import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Building,
  Calendar,
  Bookmark,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import "../styles/IncomingRequests.css";

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(
        `${baseUrl}/api/v1/btp-requests/incoming`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      setError("Failed to fetch incoming requests. Please try again.");
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this request?`
    );
    if (!confirmed) return;
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.patch(
        `${baseUrl}/api/v1/btp-requests/${requestId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchIncomingRequests();
      toast.success(`Request ${action}ed successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing the request:`, error);
      toast.error(`Failed to ${action} the request. Please try again.`);
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
      <div className="incoming-requests-container">
        <h1>Incoming BTP Requests</h1>

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
                    <User size={18} />
                    <strong>Student Name:</strong>
                    <span>{request.Student.name}</span>
                  </div>
                  <div className="info-row">
                    <Mail size={18} />
                    <strong>Student Email:</strong>
                    <span>{request.Student.email}</span>
                  </div>
                  <div className="info-row">
                    <Building size={18} />
                    <strong>Department:</strong>
                    <span>{request.Student.department}</span>
                  </div>
                  <div className="info-row">
                    <Calendar size={18} />
                    <strong>Received Date:</strong>
                    <span>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <LinkIcon size={18} />
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
                    <div className="info-row">
                      <FileText size={18} />
                      <strong>Project Idea:</strong>
                      <span className="text-sm text-gray-600">
                        {request.projectIdea}
                      </span>
                    </div>
                  )}
                </div>
                {activeTab === "pending" && (
                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleRequestAction(request.id, "accept")}
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRequestAction(request.id, "reject")}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}
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

export default IncomingRequests;
