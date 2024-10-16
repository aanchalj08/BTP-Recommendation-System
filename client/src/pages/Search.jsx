import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";
import "../styles/Search.css";
import { FaUserGraduate, FaUniversity, FaBookReader } from "react-icons/fa";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [domainOptions, setDomainOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsPerPage = 8;

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    const type = queryParams.get("searchType");
    setUserRole(role || "");

    if (type !== searchType) {
      setSearchType(type || "");
      setSearchTerm("");
      setSearchResults([]);
      setHasSearched(false);
      setCurrentPage(0);
      setError("");
    }

    if (location.state && location.state.searchResults) {
      setSearchResults(location.state.searchResults);
      setCurrentPage(0);
    }
  }, [location, searchType]);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/domains`);
      const domains = response.data;
      const options = domains.map((domain) => ({
        value: domain.name,
        label: domain.name,
      }));
      setDomainOptions(options);
    } catch (error) {
      console.error("Error fetching domains:", error);
      setError("Failed to fetch domains. Please try again.");
    }
  };

  const handleNavbarSearch = () => {
    navigate(`/search?userType=${userRole}`);
  };

  const handleSearch = async () => {
    if (!searchTerm || (Array.isArray(searchTerm) && searchTerm.length === 0)) {
      setError(
        `${
          searchType.charAt(0).toUpperCase() + searchType.slice(1)
        } field is required`
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      setHasSearched(true);
      const token = JSON.parse(localStorage.getItem("auth"));
      let url = `${baseUrl}/api/v1/search-users?`;

      if (searchType === "domain") {
        const selectedDomains = searchTerm.map((option) =>
          encodeURIComponent(option.value)
        );
        url += `domain=${selectedDomains.join(",")}`;
      } else if (searchType === "faculty") {
        url += `name=${encodeURIComponent(searchTerm)}`;
      } else {
        url += `${searchType}=${encodeURIComponent(searchTerm)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.users);
      setCurrentPage(0);
      setSearchTerm("");
    } catch (error) {
      console.error("Error searching users:", error);
      setError("An error occurred while searching. Please try again.");
    }
    setLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && searchType !== "domain") {
      handleSearch();
    }
  };

  const handleViewPublications = (e, userId) => {
    e.stopPropagation();
    navigate(`/user/${userId}?userType=${userRole}&searchType=${searchType}`, {
      state: { searchResults },
    });
  };

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) =>
      Math.min(
        Math.floor((searchResults.length - 1) / resultsPerPage),
        prevPage + 1
      )
    );
  };

  const getCurrentPageResults = () => {
    const startIndex = currentPage * resultsPerPage;
    return searchResults.slice(startIndex, startIndex + resultsPerPage);
  };

  const renderSearchInput = () => {
    switch (searchType) {
      case "faculty":
        return (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter faculty name"
          />
        );
      case "department":
        return (
          <select
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="CCE">CCE</option>
            <option value="ECE">ECE</option>
            <option value="MME">MME</option>
          </select>
        );
      case "domain":
        return (
          <Select
            isMulti
            value={searchTerm}
            onChange={(selected) => setSearchTerm(selected)}
            options={domainOptions}
            placeholder="Select Domains"
            className="domain-select"
          />
        );
      default:
        return null;
    }
  };

  const renderSearchOptions = () => (
    <div className="search-options">
      <div
        className="search-option"
        onClick={() => {
          navigate(`/search?userType=${userRole}&searchType=faculty`);
          setSearchResults([]);
          setHasSearched(false);
        }}
      >
        <FaUserGraduate className="option-icon" />
        <h3>Search by Faculty</h3>
        <p>Find publications by faculty name</p>
      </div>
      <div
        className="search-option"
        onClick={() => {
          navigate(`/search?userType=${userRole}&searchType=department`);
          setSearchResults([]);
          setHasSearched(false);
        }}
      >
        <FaUniversity className="option-icon" />
        <h3>Search by Department</h3>
        <p>Explore research in specific departments</p>
      </div>
      <div
        className="search-option"
        onClick={() => {
          navigate(`/search?userType=${userRole}&searchType=domain`);
          setSearchResults([]);
          setHasSearched(false);
        }}
      >
        <FaBookReader className="option-icon" />
        <h3>Search by Domain</h3>
        <p>Discover publications in various domains</p>
      </div>
    </div>
  );

  return (
    <>
      <Navbar onSearchClick={handleNavbarSearch} />
      <div className="search-main">
        <div className="search-container">
          <h1>Search for Users and Their Journals</h1>
          {!searchType ? (
            renderSearchOptions()
          ) : (
            <>
              <div className="search-form">
                {renderSearchInput()}
                <button onClick={handleSearch}>Search</button>
              </div>
              {error && <p className="error-message">{error}</p>}
              {loading && <p>Loading...</p>}
              {hasSearched && searchResults.length === 0 && !loading && (
                <div className="empty-search">No results found!</div>
              )}
              {searchResults.length > 0 && (
                <div className="search-results">
                  <h2>Search Results:</h2>
                  <ul>
                    {getCurrentPageResults().map((user) => (
                      <li key={user.id} className="result-card">
                        <strong>Name:</strong> {user.name} <br />
                        <strong>Department:</strong> {user.department} <br />
                        <strong>Email:</strong> {user.email} <br />
                        <strong>Domains:</strong> {user.domains.join(", ")}{" "}
                        <br />
                        <button
                          onClick={(e) => handleViewPublications(e, user.id)}
                          className="view-publications-button"
                        >
                          View Publications
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="pagination-controls">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 0}
                      className="pagination-button"
                    >
                      Previous
                    </button>
                    <span className="page-indicator">
                      Page {currentPage + 1} of{" "}
                      {Math.ceil(searchResults.length / resultsPerPage)}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={
                        currentPage >=
                        Math.floor((searchResults.length - 1) / resultsPerPage)
                      }
                      className="pagination-button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
