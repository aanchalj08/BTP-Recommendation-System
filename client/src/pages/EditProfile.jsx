import React, { useState, useEffect } from "react";
import { AlertCircle, Save, Edit3, PlusCircle, XCircle } from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    department: "",
    authorID: "",
    domains: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [domainOptions, setDomainOptions] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchUserData();
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/domains`);
      const domains = response.data;
      setDomainOptions(
        domains.map((domain) => ({ value: domain.name, label: domain.name }))
      );
    } catch (error) {
      console.error("Error fetching domains:", error);
      setError("Failed to fetch domains. Please try again.");
    }
  };

  const handleAddNewDomain = async () => {
    if (!newDomain) return;

    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.post(
        `${baseUrl}/api/v1/domains`,
        { name: newDomain },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData((prevData) => ({
        ...prevData,
        domains: [...prevData.domains, newDomain],
      }));
      setNewDomain("");
      fetchDomains();
    } catch (error) {
      console.error("Error adding new domain:", error);
      setError("Failed to add new domain. Please try again.");
    }
  };

  const handleAddExistingDomain = () => {
    if (!selectedDomain) return;
    if (!userData.domains.includes(selectedDomain)) {
      setUserData((prevData) => ({
        ...prevData,
        domains: [...prevData.domains, selectedDomain],
      }));
    }
    setSelectedDomain("");
  };

  const fetchUserData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(`${baseUrl}/api/v1/teacher/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      setUserData(data);
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

  const removeDomain = (index) => {
    setUserData((prevData) => ({
      ...prevData,
      domains: prevData.domains.filter((_, i) => i !== index),
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
        `${baseUrl}/api/v1/teacher/profile`,
        JSON.stringify(userData),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.data;
      setMessage(data.message || "Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
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
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department:</label>
            {isEditing ? (
              <select
                id="department"
                name="department"
                value={userData.department}
                className="department-box"
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="CCE">CCE</option>
                <option value="ECE">ECE</option>
                <option value="MME">MME</option>
              </select>
            ) : (
              <input
                type="text"
                id="department"
                name="department"
                value={userData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="authorID">Author ID:</label>
            <input
              type="text"
              id="authorID"
              name="authorID"
              value={userData.authorID}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Domains:</label>
            {userData.domains.map((domain, index) => (
              <div key={index} className="domain-input">
                <input type="text" value={domain} disabled={true} required />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeDomain(index)}
                    className="remove-domain"
                  >
                    <XCircle className="x-circle" size={16} />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <>
                <div className="add-domain-container">
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="domain-box"
                  >
                    <option value="">Select Existing Domain</option>
                    {domainOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExistingDomain}
                    className="add-domain"
                  >
                    <PlusCircle size={20} /> Add Domain
                  </button>
                </div>
                <div className="add-domain-container">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="Enter new domain"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewDomain}
                    className="add-domain"
                  >
                    <PlusCircle size={20} /> Add New Domain
                  </button>
                </div>
              </>
            )}
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

export default EditProfile;
