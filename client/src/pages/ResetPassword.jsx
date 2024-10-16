import React, { useState } from "react";
import collegelogo from "../assets/collegelogo.png";
import "../styles/ResetPassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const password = e.target.newPassword.value;
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/reset-password/${resetToken}`,
        { password }
      );
      localStorage.setItem("auth", JSON.stringify(response.data.token));
      toast.success("Password reset successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-main">
      <div className="reset-left">
        <img src={collegelogo} alt="College Logo" className="college-logo" />
      </div>
      <div className="reset-right">
        <div className="reset-right-container">
          <div className="reset-center">
            <h2>Reset Password</h2>
            <p>Please enter new Password</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new Password"
                  name="newPassword"
                  required={true}
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
              <button type="submit" className="try-btn" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <Link to="/" className="go-back-link">
              Go Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
