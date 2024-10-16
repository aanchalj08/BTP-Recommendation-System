import React, { useEffect, useState } from "react";
import collegelogo from "../assets/collegelogo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const StudentLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let email = e.target.email.value;
    let password = e.target.password.value;
    const baseUrl = import.meta.env.VITE_BASE_URL;

    if (email.length > 0 && password.length > 0) {
      const formData = { email, password };
      try {
        const response = await axios.post(
          `${baseUrl}/api/v1/student-login`,
          formData
        );
        localStorage.setItem("auth", JSON.stringify(response.data.token));
        toast.success("Login successful");
        navigate("/dashboard?userType=student");
      } catch (err) {
        toast.error(
          err.response?.data?.msg || "Login failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please fill all inputs");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token !== "") {
      toast.success("You are already logged in");
      navigate("/dashboard?userType=student");
    }
  }, [token, navigate]);

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={collegelogo} alt="College Logo" className="college-logo" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-center">
            <h2 className="welcome-text">Welcome back!</h2>
            <p className="login-subtitle">Please enter your details</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <input type="email" placeholder="Email" name="email" required />
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  required
                />
                <span className="input-highlight"></span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" id="remember-checkbox" />
                  <span className="checkmark"></span>
                  Remember for 30 days
                </label>
                <Link to="/forgotpassword" className="forgot-pass-link">
                  Forgot Password?
                </Link>
              </div>
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  "Log In"
                )}
              </button>
              {isLoading && (
                <p className="loading-message">
                  Verifying credentials and preparing your dashboard...
                </p>
              )}
            </form>
          </div>
          <p className="login-bottom-p">
            Don't have an account? <Link to="/student/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
