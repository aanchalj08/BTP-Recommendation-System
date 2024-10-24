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
  Link,
  FileText,
  Users,
  Edit,
} from "lucide-react";
import { toast } from "react-toastify";
import "../styles/IncomingRequests.css";

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
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
      console.log(response);
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
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || "An error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleRequestEdit = (requestId, newStatus) => {
    setSelectedRequest(requestId);
    setNewStatus(newStatus);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.patch(
        `${baseUrl}/api/v1/btp-requests/${selectedRequest}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchIncomingRequests();
      toast.success(`Request status updated successfully!`);
    } catch (error) {
      console.error("Error updating the request:", error);
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || "An error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsModalOpen(false);
    }
  };

  const StatusEditModal = ({ isOpen, onClose, onSave }) => {
    const handleSubmit = () => {
      onSave();
    };

    return (
      isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Request Status</h3>
            <p>
              Are you sure you want to{" "}
              {newStatus === "approved" ? "approve" : "reject"} this request?
            </p>
            <button onClick={handleSubmit}>Confirm</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      )
    );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                  <div className="group-members-section">
                    <div className="section-header">
                      <Users size={18} />
                      <strong>{request.groupName}</strong>
                    </div>
                    {request.students.map((student, index) => (
                      <div key={student.id} className="member-details">
                        <div className="info-row">
                          <User size={16} />
                          <strong>Name:</strong>
                          <span>{student.name}</span>
                        </div>
                        <div className="info-row">
                          <Mail size={16} />
                          <strong>Email:</strong>
                          <span>{student.email}</span>
                        </div>
                        <div className="info-row">
                          <Building size={16} />
                          <strong>CGPA:</strong>
                          <span>{student.cgpa}</span>
                        </div>
                        <div className="info-row">
                          <Link size={16} />
                          <a
                            href={student.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Resume Link
                          </a>
                        </div>
                        {index < request.students.length - 1 && (
                          <div className="member-divider"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="info-row">
                    <Calendar size={18} />
                    <strong>Submitted:</strong>
                    <span>{formatDate(request.createdAt)}</span>
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

                {activeTab === "accepted" && (
                  <div className="request-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleRequestEdit(request.id, "reject")}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                )}

                {activeTab === "rejected" && (
                  <div className="request-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleRequestEdit(request.id, "accept")}
                    >
                      <Edit size={16} />
                      Edit
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
        <StatusEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStatus}
        />
      </div>
    </>
  );
};

export default IncomingRequests;
