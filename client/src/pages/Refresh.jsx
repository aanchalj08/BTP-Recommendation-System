import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Refresh.css";
import Navbar from "./Navbar";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const Refresh = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [user, setUser] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleRefresh = async () => {
    setIsLoading(true);
    setStatus("idle");
    const token = JSON.parse(localStorage.getItem("auth")) || "";
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/refresh-publications`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error refreshing publications:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="refresh-container">
        <div className="refresh-card">
          <h1>Refresh Publications Data</h1>
          <p className="refresh-description">
            Keep your research up to date! Click the button below to sync your
            latest publications from Scopus.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`refresh-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="icon spinning" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="icon" />
                Refresh Data
              </>
            )}
          </button>
          {status === "success" && (
            <div className="status-message success">
              <CheckCircle className="icon" />
              Data updated successfully!
            </div>
          )}
          {status === "error" && (
            <div className="status-message error">
              <AlertCircle className="icon" />
              Error refreshing publications. Please try again.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Refresh;
