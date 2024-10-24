import React, { useState, useEffect } from "react";
import { AlertCircle, Save, Edit3 } from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import "../styles/EditStudentProfile.css";

const EditStudentProfile = () => {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    department: "",
    cgpa: "",
    resumeLink: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(`${baseUrl}/api/v1/student-data`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (err) {
      setError("Failed to load user data. Please try again.");
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      handleEdit();
      return;
    }

    setError("");
    setMessage("");

    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.put(
        `${baseUrl}/api/v1/update-student`,
        {
          cgpa: userData.cgpa,
          resumeLink: userData.resumeLink,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.msg || "Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="edit-profile-container">
        <h1>Edit Your Profile</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              disabled={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department:</label>
            <input
              type="text"
              id="department"
              name="department"
              value={userData.department}
              disabled={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cgpa">CGPA:</label>
            <input
              type="number"
              id="cgpa"
              name="cgpa"
              value={userData.cgpa}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              step="0.01"
              min="0"
              max="10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="resumeLink">
              Resume Link (with appropiate access):
            </label>
            <input
              type="url"
              id="resumeLink"
              name="resumeLink"
              value={userData.resumeLink}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>
          <button
            type="submit"
            className={isEditing ? "save-button" : "edit-button"}
          >
            {isEditing ? (
              <>
                <Save size={20} /> Save Changes
              </>
            ) : (
              <>
                <Edit3 size={20} /> Edit Profile
              </>
            )}
          </button>
        </form>
        {message && (
          <div className="message">
            <AlertCircle size={20} />
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default EditStudentProfile;
