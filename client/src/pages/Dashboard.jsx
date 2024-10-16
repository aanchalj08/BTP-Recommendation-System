import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "./Navbar";
import {
  FaSearch,
  FaPlus,
  FaSync,
  FaUserGraduate,
  FaSignOutAlt,
  FaUniversity,
  FaBookReader,
} from "react-icons/fa";

const Dashboard = () => {
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const [data, setData] = useState({});
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchName = async () => {
    let axiosConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/dashboard`,
        axiosConfig
      );
      setData({ msg: response.data.msg, luckyNumber: response.data.secret });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const LoadingMessage = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Loading your research dashboard...</p>
      </div>
    </div>
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    setUserRole(role || "");
    fetchName();
    if (token === "") {
      navigate("/");
      toast.warn("Please login first to access dashboard");
    }
  }, [token, location, navigate]);

  const renderStudentCards = () => (
    <>
      <div className="dashboard-card">
        <FaUserGraduate className="card-icon" />
        <h2>Search by Faculty</h2>
        <p>Find publications by faculty name</p>
        <button
          onClick={() =>
            navigate(`/search?userType=${userRole}&searchType=faculty`)
          }
          className="card-button"
        >
          Search Faculty
        </button>
      </div>
      <div className="dashboard-card">
        <FaUniversity className="card-icon" />
        <h2>Search by Department</h2>
        <p>Explore research in specific departments</p>
        <button
          onClick={() =>
            navigate(`/search?userType=${userRole}&searchType=department`)
          }
          className="card-button"
        >
          Search Department
        </button>
      </div>
      <div className="dashboard-card">
        <FaBookReader className="card-icon" />
        <h2>Search by Domain</h2>
        <p>Discover publications in various domains</p>
        <button
          onClick={() =>
            navigate(`/search?userType=${userRole}&searchType=domain`)
          }
          className="card-button"
        >
          Search Domain
        </button>
      </div>
    </>
  );

  const renderTeacherCards = () => (
    <>
      <div className="dashboard-card">
        <FaSearch className="card-icon" />
        <h2>Search Publications</h2>
        <p>Explore research from LNMIIT and beyond</p>
        <button
          onClick={() => navigate(`/search?userType=${userRole}`)}
          className="card-button"
        >
          Search Now
        </button>
      </div>
      <div className="dashboard-card">
        <FaPlus className="card-icon" />
        <h2>Add Publication</h2>
        <p>Contribute your latest research findings</p>
        <button
          onClick={() => navigate("/add?userType=teacher")}
          className="card-button"
        >
          Add New
        </button>
      </div>
      <div className="dashboard-card">
        <FaSync className="card-icon" />
        <h2>Refresh Data</h2>
        <p>Update your publication information</p>
        <button
          onClick={() => navigate("/refresh?userType=teacher")}
          className="card-button"
        >
          Refresh
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-main">
      <Navbar userRole={userRole} />
      <div className="dashboard-content">
        <h1>{userRole === "student" ? "Guide My BTP" : "BTP Guide"}</h1>

        <p className="welcome-message">
          {`${data.msg}, welcome to ${
            userRole === "student" ? "Guide My BTP" : "BTP Guide"
          }! `}
          {userRole === "student"
            ? "Here you can search for faculties and their publications based on faculty's name, department, or their work domains."
            : "Here you can see your publications, update them, and search and view other faculty and their publications."}
        </p>

        <div className="dashboard-cards">
          {userRole === "student" ? renderStudentCards() : renderTeacherCards()}
        </div>
      </div>
      {isLoading && <LoadingMessage />}
    </div>
  );
};

export default Dashboard;
