import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";
import Navbar from "./Navbar";
import "../styles/GroupManagement.css";

const GroupManagement = () => {
  const location = useLocation();

  const [groupName, setGroupName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const navigate = useNavigate();
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("auth")) || "";
  const [message, setMessage] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message);

      const timer = setTimeout(() => {
        setMessage("");
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRequests(),
        fetchGroupDetails(),
        checkGroupLeaderStatus(),
      ]);
    } catch (error) {
      setError("Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/group-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentRequests(response.data.sent);
      setReceivedRequests(response.data.received);
    } catch (error) {
      setError(error.response?.data?.msg || "Error fetching requests");
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/group-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupDetails(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setGroupDetails(null);
      } else {
        setError(error.response?.data?.msg || "Error fetching group details");
      }
    }
  };

  const checkGroupLeaderStatus = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/check-leader`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsGroupLeader(response.data.isLeader);
    } catch (error) {
      setError(error.response?.data?.msg || "Error checking leader status");
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/v1/groups`,
        { name: groupName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Group created successfully");
      setGroupName("");
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.msg || "Error creating group");
    } finally {
      setActionLoading(false);
    }
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/v1/group-requests`,
        { email: studentEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Request sent successfully");
      setStudentEmail("");
      await fetchRequests();
    } catch (error) {
      setError(error.response?.data?.msg || "Error sending request");
    } finally {
      setActionLoading(false);
    }
  };

  const respondToRequest = async (requestId, accept) => {
    setActionLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/v1/group-requests/${requestId}/respond`,
        { accept },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(accept ? "Request accepted" : "Request rejected");
      await fetchRequests();
      await fetchGroupDetails();
    } catch (error) {
      setError(error.response?.data?.msg || "Error responding to request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loa-spinner">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="group-system">
        {message && <p className="btp-msg">{message}</p>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="create-group-section">
          <p className="group-title">Create New Group</p>
          <form onSubmit={createGroup}>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
              disabled={
                isGroupLeader ||
                (groupDetails && !isGroupLeader) ||
                actionLoading
              }
            />
            <button
              type="submit"
              className="create-btn"
              disabled={
                isGroupLeader ||
                (groupDetails && !isGroupLeader) ||
                actionLoading
              }
            >
              {actionLoading ? "Creating..." : "Create Group"}
            </button>
          </form>
        </div>

        <div className="send-request-section">
          <p className="group-title">Send Group Request</p>
          <form onSubmit={sendRequest}>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="Enter student email"
              required
              disabled={(groupDetails && !isGroupLeader) || actionLoading}
            />
            <button
              type="submit"
              className="req-btn"
              disabled={(groupDetails && !isGroupLeader) || actionLoading}
            >
              {actionLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </div>

        {groupDetails && (
          <div className="group-details-section">
            <p className="group-title">Your Group Details</p>
            <div className="group-details-content">
              <div className="group-info-card">
                <div className="group-info-title">Group Information</div>
                <p>Group Name: {groupDetails.groupName}</p>
                <p>Member Count: {groupDetails.memberCount}</p>
              </div>

              <div className="group-info-card">
                <div className="group-info-title">Members List</div>
                <div className="group-members-list">
                  <ul>
                    {groupDetails.members.map((member) => (
                      <li key={member.id}>
                        {member.name} ({member.email})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="requests-section">
          <p className="group-title">Request Management</p>
          <div className="requests-container">
            <div className="requests-column received-requests">
              <h3>Received Requests</h3>
              <div className="requests-list">
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <div className="request-user">
                          <div className="request-user-avatar">
                            {request.Sender.name.charAt(0)}
                          </div>
                          <div className="request-user-details">
                            <div className="request-user-name">
                              {request.Sender.name}
                            </div>
                            <div className="request-user-email">
                              {request.Sender.email}
                            </div>
                          </div>
                        </div>
                        <div className="request-group">
                          {request.Group.name}
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          className="accept"
                          onClick={() => respondToRequest(request.id, true)}
                          disabled={actionLoading}
                        >
                          Accept Request
                        </button>
                        <button
                          className="reject"
                          onClick={() => respondToRequest(request.id, false)}
                          disabled={actionLoading}
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-requests">No received requests</div>
                )}
              </div>
            </div>

            <div className="requests-column sent-requests">
              <h3>Sent Requests</h3>
              <div className="requests-list">
                {sentRequests.length > 0 ? (
                  sentRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <div className="request-user">
                          <div className="request-user-avatar">
                            {request.Receiver.name.charAt(0)}
                          </div>
                          <div className="request-user-details">
                            <div className="request-user-name">
                              {request.Receiver.name}
                            </div>
                            <div className="request-user-email">
                              {request.Receiver.email}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`request-status ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-requests">No sent requests</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupManagement;
