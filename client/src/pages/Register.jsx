import React, { useEffect, useState } from "react";
import collegelogo from "../assets/collegelogo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "../styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const navigate = useNavigate();
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const baseUrl = "https://btp-recommendation-system.onrender.com";

  const [domainOptions, setDomainOptions] = useState([]);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/domains`);
      const domains = response.data;
      const options = [
        ...domains.map((domain) => ({
          value: domain.name,
          label: domain.name,
        })),
        { value: "Others", label: "Others" },
      ];

      setDomainOptions(options);
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast.error("Failed to fetch domains. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let name = e.target.name.value;
    let lastname = e.target.lastname.value;
    let email = e.target.email.value;
    let department = e.target.department.value;
    let authorID = e.target.authorID.value;
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;
    const passwordRegex = /^(?=.*\d)[A-Za-z\d@$!%*?&]{5,}$/;
    const baseUrl = "https://btp-recommendation-system.onrender.com";

    if (
      name.length > 0 &&
      lastname.length > 0 &&
      email.length > 0 &&
      department.length > 0 &&
      authorID.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      selectedDomains.length > 0
    ) {
      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must be at least 5 characters long and include a number, and a special character."
        );
        setIsLoading(false);
        return;
      }
      if (password === confirmPassword) {
        const formData = {
          username: name + " " + lastname,
          email,
          department,
          authorID,
          password,
          domains: selectedDomains.map((domain) => domain.value),
        };
        try {
          const response = await axios.post(
            `${baseUrl}/api/v1/register`,
            formData
          );
          toast.success("Registration successful");
          navigate("/login");
        } catch (err) {
          toast.error(
            err.response?.data?.msg || "Registration failed. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Passwords don't match");
        setIsLoading(false);
      }
    } else {
      toast.error("Please fill all inputs and select at least one domain");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token !== "") {
      toast.success("You are already logged in");
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="register-main">
      <div className="register-left">
        <img src={collegelogo} alt="College Logo" className="college-logo" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-center">
            <h2 className="welcome-text">Welcome!</h2>
            <p className="register-subtitle">Please enter your details</p>
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First name *"
                  name="name"
                  required={true}
                />
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Last name *"
                  name="lastname"
                  required={true}
                />
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email *"
                  name="email"
                  required={true}
                />
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <select
                  name="department"
                  required={true}
                  className="department-box"
                >
                  <option value="" disabled selected>
                    Select Department
                  </option>
                  <option value="CSE">CSE</option>
                  <option value="CCE">CCE</option>
                  <option value="ECE">ECE</option>
                  <option value="MME">MME</option>
                </select>
                <span className="input-highlight"></span>
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Scopus Author ID *"
                  name="authorID"
                  required={true}
                />
                <span className="input-highlight"></span>
              </div>
              <Select
                isMulti
                name="domains"
                options={domainOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Domains"
                required={true}
                onChange={(selectedOptions) =>
                  setSelectedDomains(selectedOptions)
                }
              />
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  name="password"
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
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password *"
                  name="confirmPassword"
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
              <button
                type="submit"
                className="register-btn"
                disabled={isLoading}
              >
                {isLoading
                  ? "Getting ready, fetching data from Scopus..."
                  : "Sign Up"}
              </button>
            </form>
          </div>
          <p className="login-bottom-p">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
