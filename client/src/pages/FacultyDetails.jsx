import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tab } from "@headlessui/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";
import "../styles/FacultyDetails.css";

const FacultyDetails = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [faculty, setFaculty] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showBtpModal, setShowBtpModal] = useState(false);
  const [btpModalStep, setBtpModalStep] = useState(1);
  const [groupDetails, setGroupDetails] = useState(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [btpRequestLoading, setBtpRequestLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const navigationState = location.state || {};
  const { searchResults = [] } = navigationState;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("searchType");
    const role = queryParams.get("userType");
    setUserRole(role || "");

    if (type !== searchType) {
      setSearchType(type || "");
    }

    const fetchFacultyDetails = async () => {
      if (navigationState.faculty) {
        setFaculty(navigationState.faculty);
        setLoading(false);
        return;
      }
    };

    const fetchProjects = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        const response = await axios.get(
          `${baseUrl}/api/v1/faculty/${facultyId}/projects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(response.data.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyDetails();
    fetchProjects();
  }, [facultyId, baseUrl, navigationState.faculty]);

  const handleViewPublications = () => {
    const userRole = "student";
    navigate(
      `/user/${facultyId}?userType=${userRole}&searchType=${searchType}`,
      {
        state: {
          searchResults,
          facultyId,
        },
      }
    );
  };

  const handleBackClick = () => {
    navigate(`/search?userType=${userRole}&searchType=${searchType}`, {
      state: { searchResults: location.state.searchResults },
    });
  };

  const fetchGroupDetails = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(`${baseUrl}/api/v1/group-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        navigate(`/grp-request?userType=${userRole}`, {
          state: {
            message:
              "You must create a group of 1-4 members before sending a BTP request.",
          },
        });
      }
      throw error;
    }
  };

  const handleSendBTPRequest = async () => {
    setBtpRequestLoading(true);
    try {
      const groupData = await fetchGroupDetails();
      setGroupDetails(groupData);
      setShowBtpModal(true);
      setBtpModalStep(1);
    } catch (error) {
      if (!error.response?.status === 404) {
        console.error("Error fetching group details:", error);
        toast.error("Failed to fetch group details");
      }
    } finally {
      setBtpRequestLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setBtpModalStep(1);
  };

  const handleConfirmSubmit = async () => {
    if (btpRequestLoading) return;
    setBtpRequestLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      await axios.post(
        `${baseUrl}/api/v1/btp-requests`,
        {
          facultyId,
          projectIdea,
          groupId: groupDetails.groupId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("BTP request sent successfully!", {
        toastId: "btp-success",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShowBtpModal(false);
      setBtpModalStep(1);
      setProjectIdea("");
    } catch (error) {
      console.error("Error sending BTP request:", error);
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || "An error occurred.";
        toast.error(errorMessage, {
          toastId: "btp-error",
        });
      } else {
        toast.error("An unexpected error occurred.", {
          toastId: "btp-error-unexpected",
        });
      }
    } finally {
      setBtpRequestLoading(false);
    }
  };

  const BtpRequestModal = () => {
    const [tempProjectIdea, setTempProjectIdea] = useState(projectIdea);
    const [saveLoading, setSaveLoading] = useState(false);
    const [nextLoading, setNextLoading] = useState(false);

    const handleSaveProjectIdea = () => {
      setSaveLoading(true);
      setTimeout(() => {
        setProjectIdea(tempProjectIdea);
        setSaveLoading(false);
      }, 500);
    };

    const handleNextStep = () => {
      if (projectIdea.length === 0) {
        alert("No project idea saved before proceeding!");
      }
      setNextLoading(true);
      setTimeout(() => {
        setBtpModalStep(2);
        setNextLoading(false);
      }, 500);
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>BTP Request Details</h2>
          {btpModalStep === 1 ? (
            <>
              <div className="group-details">
                <h3>
                  {groupDetails.groupName} ({groupDetails.memberCount} Members)
                </h3>
                <ul>
                  {groupDetails.members.map((member) => (
                    <li key={member.id}>
                      {member.name} ({member.email})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="project-idea-input">
                <label htmlFor="projectIdea">
                  Project Idea (max 200 characters):
                </label>
                <textarea
                  id="projectIdea"
                  value={tempProjectIdea}
                  onChange={(e) =>
                    setTempProjectIdea(e.target.value.slice(0, 200))
                  }
                  maxLength={200}
                  rows={4}
                />
                <div className="char-count">
                  {tempProjectIdea.length}/200 characters
                </div>
                <button
                  onClick={handleSaveProjectIdea}
                  disabled={saveLoading}
                  className={saveLoading ? "loading" : ""}
                >
                  {saveLoading
                    ? "Saving..."
                    : projectIdea
                    ? "Modify Saved Idea"
                    : "Save Project Idea"}
                </button>
              </div>
              <div className="modal-buttons">
                <button onClick={() => setShowBtpModal(false)}>Cancel</button>
                <button
                  onClick={handleNextStep}
                  disabled={nextLoading}
                  className={nextLoading ? "loading" : ""}
                >
                  {nextLoading ? "Loading..." : "Next"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Confirm BTP Request</h3>
              <p>Are you sure you want to send this BTP request?</p>
              <div className="project-idea-preview">
                <h4>Project Idea:</h4>
                <p>{projectIdea}</p>
              </div>
              <div className="modal-buttons">
                <button
                  onClick={handlePreviousStep}
                  disabled={btpRequestLoading}
                >
                  Previous
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={btpRequestLoading}
                  className={btpRequestLoading ? "loading" : ""}
                >
                  {btpRequestLoading ? "Sending..." : "Confirm"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="faculty-details-page">
      <Navbar />
      <div className="faculty-details-container">
        {faculty && (
          <div className="faculty-info-card">
            <h1 className="faculty-name">{faculty.name}</h1>
            <div className="faculty-info-grid">
              <div className="info-column">
                <p>
                  <span className="info-label">Department:</span>{" "}
                  {faculty.department}
                </p>
                <p>
                  <span className="info-label">Email:</span> {faculty.email}
                </p>
              </div>
              <div className="info-column">
                <p>
                  <span className="info-label">Domains:</span>{" "}
                  {faculty.domains?.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tab.Group>
          <Tab.List className="tabs-header">
            {["Publications", "Projects", "BTP Request"].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  selected ? "tab-button active" : "tab-button"
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="tabs-content">
            <Tab.Panel className="tab-panel">
              <div className="publications-container">
                <button
                  onClick={handleViewPublications}
                  className="view-publications-button"
                >
                  View Publications
                </button>
              </div>
            </Tab.Panel>

            <Tab.Panel className="tab-panel">
              <div className="projects-grid">
                {projects.length === 0 ? (
                  <div>
                    <p className="no-projects-message">No projects found !</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="project-card">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-description">
                        {project.description}
                      </p>
                      <div className="domain-tags">
                        {project.domains.map((domain, index) => (
                          <span key={index} className="domain-tag">
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>

            <Tab.Panel className="tab-panel">
              <div className="btp-request-container">
                <h3 className="btp-request-title">Send BTP Request</h3>
                <p className="btp-request-description">
                  Click below to start the BTP request process
                </p>
                <button
                  onClick={handleSendBTPRequest}
                  className={`btp-request-button ${
                    btpRequestLoading ? "loading" : ""
                  }`}
                  disabled={btpRequestLoading}
                >
                  {btpRequestLoading ? "Loading..." : "Start BTP Request"}
                </button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {showBtpModal && <BtpRequestModal />}

      <div className="go-back">
        <button onClick={handleBackClick}>Go Back To Search Results</button>
      </div>
      <ToastContainer
        limit={3}
        newestOnTop={false}
        preventDuplicates
        autoClose={3000}
      />
    </div>
  );
};

export default FacultyDetails;
