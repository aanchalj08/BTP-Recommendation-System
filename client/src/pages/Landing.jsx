import React from "react";
import { Link } from "react-router-dom";
import { UserCircle, GraduationCap } from "lucide-react";
import "../styles/Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      <h1 className="landing-title">BTP Guide, LNMIIT</h1>
      <p className="landing-subtitle">
        Your Gateway to LNMIIT's Research Excellence
      </p>

      <div className="card-container">
        <Card title="Faculty" icon={<UserCircle size={48} />}>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </Card>

        <Card title="Student" icon={<GraduationCap size={48} />}>
          <Link to="/student/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/student/register" className="btn btn-secondary">
            Register
          </Link>
        </Card>
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        {icon}
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Landing;
