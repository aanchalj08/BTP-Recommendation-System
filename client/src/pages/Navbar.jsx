import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import collegelogo from "../assets/collegelogo.png";
import { User, PlusCircle } from "lucide-react";

function Navbar({ onSearchClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const addMenuRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    setUserRole(role || "");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsAddMenuOpen(false);
  };

  const toggleAddMenu = () => {
    setIsAddMenuOpen(!isAddMenuOpen);
    setIsUserMenuOpen(false);
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
      { to: "/saved-itineraries", text: "View Your Publications" },
      { to: "/refresh", text: "Refresh Your Data" },
      { to: "/faculty/incoming-requests", text: "View requests" },
    ];
    const studentLinks = [
      { to: "/student/sent-requests", text: "View requets" },
      { to: "/grp-request", text: "Group Details" },
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
        {userRole === "teacher" && (
          <div className="add-icon" onClick={toggleAddMenu} ref={addMenuRef}>
            <PlusCircle size={24} />
            <div className={`user-dropdown ${isAddMenuOpen ? "show" : ""}`}>
              <>
                <Link to={`/add?userType=${userRole}`} onClick={toggleAddMenu}>
                  Add Publication
                </Link>
                <Link
                  to={`/edit-projects?userType=${userRole}`}
                  onClick={toggleAddMenu}
                >
                  Float Project Ideas
                </Link>
              </>
            </div>
          </div>
        )}
        <div className="user-icon" onClick={toggleUserMenu} ref={userMenuRef}>
          <User size={24} />
          <div className={`user-dropdown ${isUserMenuOpen ? "show" : ""}`}>
            {userRole === "teacher" && (
              <Link
                to={`/edit-profile?userType=${userRole}`}
                onClick={toggleUserMenu}
              >
                Edit Your Profile
              </Link>
            )}
            {userRole === "student" && (
              <Link
                to={`/student-edit?userType=${userRole}`}
                onClick={toggleUserMenu}
              >
                Edit Your Profile
              </Link>
            )}
            <Link to="/logout" onClick={toggleUserMenu}>
              Logout
            </Link>
          </div>
        </div>
        <div className="navbar-menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <div className={`navbar-dropdown ${isMenuOpen ? "show" : ""}`}>
          {renderNavLinks()}
          {userRole === "teacher" && (
            <>
              <Link
                to={`/edit-profile?userType=${userRole}`}
                onClick={toggleMenu}
              >
                Edit Your Profile
              </Link>
              <Link to={`/add?userType=${userRole}`} onClick={toggleAddMenu}>
                Add Publication
              </Link>
              <Link
                to={`/edit-projects?userType=${userRole}`}
                onClick={toggleAddMenu}
              >
                Float Project Ideas
              </Link>
            </>
          )}
          {userRole === "student" && (
            <Link
              to={`/student-edit?userType=${userRole}`}
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
