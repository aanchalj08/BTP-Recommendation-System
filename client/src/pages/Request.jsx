import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Send, User, Mail, FileText, MessageSquare } from "lucide-react";
import Navbar from "./Navbar";
import "../styles/Request.css";

const Request = () => {
  const [formData, setFormData] = useState({
    facultyName: "",
    facultyEmail: "",
    resumeLink: "",
    projectIdea: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const baseUrl = "https://btp-recommendation-system.onrender.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const countWords = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const validateForm = () => {
    if (
      !formData.facultyName ||
      !formData.facultyEmail ||
      !formData.resumeLink
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (countWords(formData.projectIdea) > 40) {
      setError("Project idea must not exceed 40 words");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.post(`${baseUrl}/api/v1/btp-requests`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("BTP request sent successfully!");
      navigate("/student/sent-requests");
    } catch (error) {
      console.error("Error sending BTP request:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="request-container">
        <div className="form-wrapper">
          <div className="form-card">
            <h2>Send BTP Request</h2>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>
                  <User size={18} />
                  Faculty Name *
                </label>
                <input
                  type="text"
                  name="facultyName"
                  value={formData.facultyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Faculty Email *
                </label>
                <input
                  type="email"
                  name="facultyEmail"
                  value={formData.facultyEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FileText size={18} />
                  Resume Link *
                </label>
                <input
                  type="url"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MessageSquare size={18} />
                  Project Idea (max 40 words)
                </label>
                <textarea
                  name="projectIdea"
                  value={formData.projectIdea}
                  onChange={handleInputChange}
                  rows="4"
                />
                <p className="word-count">
                  {countWords(formData.projectIdea)}/40 words
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={18} />
                    Send Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Request;
