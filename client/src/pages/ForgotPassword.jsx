import React, { useState } from "react";
import collegelogo from "../assets/collegelogo.png";
import "../styles/ForgotPassword.css";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("teacher");
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/v1/forgot-password`, {
        email,
        userType,
      });
      toast.success("Reset link sent to email");
      setEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          error.message ||
          "Failed to send reset link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-main">
      <div className="forgot-left">
        <img src={collegelogo} alt="College Logo" className="college-logo" />
      </div>
      <div className="forgot-right">
        <div className="forgot-right-container">
          <div className="forgot-center">
            <h2>Forgot Password</h2>
            <p>Please enter your Email id and select your user type</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={true}
                />
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  required={true}
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
                <span className="input-highlight"></span>
              </div>
              <button
                type="submit"
                className="reset-button"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <Link to="/" className="go-back-link">
              Go Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
