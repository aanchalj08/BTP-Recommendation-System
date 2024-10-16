import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/UserJournals.css";

const UserJournals = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userPublications, setUserPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [searchType, setSearchType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const journalsPerPage = 20;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    setUserRole(role || "");

    const searchType = queryParams.get("searchType");
    setSearchType(searchType || "");

    const fetchUserPublications = async () => {
      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        const response = await axios.get(
          `${baseUrl}/api/v1/user-publications/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserPublications(response.data.publications);
        const sUser = location.state?.searchResults?.find(
          (user) => String(user.id) === String(userId)
        );
        setSelectedUser(sUser);
      } catch (error) {
        console.error("Error fetching user publications:", error);
        setError(
          "An error occurred while fetching publications. Please try again."
        );
      }
      setLoading(false);
    };
    fetchUserPublications();
  }, [userId, location.state.searchResults, baseUrl, location]);

  const handleBackClick = () => {
    navigate(`/search?userType=${userRole}&searchType=${searchType}`, {
      state: { searchResults: location.state.searchResults },
    });
  };

  const handleViewDetails = (publicationId) => {
    navigate(`/publication/${publicationId}?userType=${userRole}`);
  };

  const indexOfLastJournal = currentPage * journalsPerPage;
  const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
  const currentJournals = userPublications.slice(
    indexOfFirstJournal,
    indexOfLastJournal
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbar />
      <div className="search-main">
        <div className="search-page">
          <div className="search-container user-journals-container">
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            {selectedUser && (
              <>
                <h2>Journals by {selectedUser.name}</h2>
                {userPublications.length === 0 ? (
                  <p className="no-journals">
                    No journals found for this user.
                  </p>
                ) : (
                  <>
                    <ul className="journal-list">
                      {currentJournals.map((publication, index) => (
                        <li key={publication.id} className="journal-item">
                          <div className="journal-number">
                            {indexOfFirstJournal + index + 1}.
                          </div>
                          <div className="journal-content">
                            <div className="journal-title">
                              {publication.title}
                            </div>
                            <p className="journal-date">
                              Published on:{" "}
                              {new Date(
                                publication.publicationDate
                              ).toLocaleDateString()}
                            </p>
                            <button
                              className="view-details-button"
                              onClick={() => handleViewDetails(publication.id)}
                            >
                              View Details
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="page-button"
                      >
                        Previous
                      </button>
                      <span className="page-number">Page {currentPage}</span>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastJournal >= userPublications.length}
                        className="page-button"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                <button onClick={handleBackClick} className="back-button">
                  Back to Search Results
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserJournals;
