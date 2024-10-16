import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import collegelogo from "../assets/collegelogo.png";
import { User } from "lucide-react";

function Navbar({ onSearchClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    setUserRole(role || "");
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate(`/search?userType=${userRole}`);
    }
    setIsMenuOpen(false);
  };

  const renderNavLinks = () => {
    const commonLinks = [
      { to: "/dashboard", text: "Home" },
      { to: "/search", text: "Search", onClick: handleSearchClick },
    ];
    const teacherLinks = [
      { to: "/add", text: "Add" },
      { to: "/saved-itineraries", text: "View Your Publications" },
      { to: "/refresh", text: "Refresh Your Data" },
      { to: "/faculty/incoming-requests", text: "View requests" },
    ];
    const studentLinks = [
      { to: "/student/sent-requests", text: "View requets" },
      { to: "/send-request", text: "Send BTP Request" },
    ];
    const links =
      userRole === "teacher"
        ? [...commonLinks, ...teacherLinks]
        : [...commonLinks, ...studentLinks];

    return links.map((link, index) => (
      <Link
        key={index}
        to={`${link.to}?userType=${userRole}`}
        className={`navbar-link ${
          location.pathname === link.to ? "active" : ""
        }`}
        onClick={(e) => {
          if (link.onClick) {
            link.onClick(e);
          } else if (location.pathname === link.to) {
            e.preventDefault();
          } else {
            setIsMenuOpen(false);
          }
        }}
      >
        {link.text}
      </Link>
    ));
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={collegelogo} alt="College Logo" className="navbar-logo" />
      </div>
      <div className="navbar-right">
        {renderNavLinks()}
        <div className="user-icon" onClick={toggleUserMenu}>
          <User size={24} />
        </div>
        <div className={`user-dropdown ${isUserMenuOpen ? "show" : ""}`}>
          {userRole === "teacher" && (
            <Link
              to={`/edit-profile?userType=${userRole}`}
              onClick={toggleUserMenu}
            >
              Edit Your Profile
            </Link>
          )}
          <Link to="/logout" onClick={toggleUserMenu}>
            Logout
          </Link>
        </div>
        <div className="navbar-menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <div className={`navbar-dropdown ${isMenuOpen ? "show" : ""}`}>
          {renderNavLinks()}
          {userRole === "teacher" && (
            <Link
              to={`/edit-profile?userType=${userRole}`}
              onClick={toggleMenu}
            >
              Edit Your Profile
            </Link>
          )}
          <Link to="/logout" onClick={toggleMenu}>
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
