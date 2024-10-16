import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/SavedItineraries.css";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { toast } from "react-toastify";

const SavedItineraries = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPublications, setTotalPublications] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const publicationsPerPage = 20;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("userType");
    setUserRole(role || "");
    fetchPublications(currentPage);
  }, [currentPage, location]);

  const fetchPublications = async (page) => {
    setPageLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(
        `${baseUrl}/api/v1/get-publications?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPublications(response.data.publications);
      setTotalPages(response.data.totalPages);
      setTotalPublications(response.data.totalPublications);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch publications");
      setLoading(false);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDelete = (publicationId) => {
    setPublicationToDelete(publicationId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.delete(
        `${baseUrl}/api/v1/delete-publication/${publicationToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowConfirmation(false);
      setPublicationToDelete(null);
      setDeleteMessage("Journal deleted successfully");
      fetchPublications(currentPage);
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (err) {
      toast.error("Failed to delete journal");
      setShowConfirmation(false);
      setPublicationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setPublicationToDelete(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) return <div className="loading-message">Loading...</div>;

  return (
    <div className="save-comp">
      <Navbar />
      <div className="saved-itineraries-container">
        <h1 className="saved-itineraries-title">My Saved Journals</h1>
        <div className="publication-count">
          Total Publications: {totalPublications}
        </div>
        {deleteMessage && (
          <div className="success-message">{deleteMessage}</div>
        )}
        {publications.length === 0 ? (
          <p className="no-itineraries">No saved journals found.</p>
        ) : (
          <>
            {pageLoading ? (
              <div className="loading-message">Loading...</div>
            ) : (
              <ul className="itinerary-list">
                {publications.map((publication, index) => (
                  <li key={publication.id} className="itinerary-item">
                    <div className="itinerary-number">
                      {(currentPage - 1) * publicationsPerPage + index + 1}
                    </div>
                    <div className="itinerary-details">
                      <h3 className="itinerary-name">{publication.title}</h3>
                      <p className="itinerary-date">
                        Published on{" "}
                        {new Date(
                          publication.publicationDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="itinerary-actions">
                      <Link
                        to={`/publication/${publication.id}?userType=${userRole}`}
                        className="view-button"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(publication.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || pageLoading}
              >
                Previous
              </button>
              <span>{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || pageLoading}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      {showConfirmation && (
        <>
          <div className="blur-overlay"></div>
          <div className="confirmation-popup">
            <p>Are you sure you want to delete this journal?</p>
            <div className="confirmation-buttons">
              <button onClick={confirmDelete} className="confirm-button">
                Yes
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SavedItineraries;
