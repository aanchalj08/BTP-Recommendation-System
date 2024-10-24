import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProjectManagement.css";
import Navbar from "./Navbar";
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  Tag,
  FileText,
  Layout,
  CheckCircle,
  Loader,
} from "lucide-react";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    domains: [],
    description: "",
  });
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem("auth")) || "";
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/my-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.projects);
      const projectsData = Array.isArray(response.data.projects)
        ? response.data.projects
        : [];
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch projects");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim() === "" || formData.domains.length === 0) {
      alert("Title and domains must be specified");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingProject) {
        await axios.put(
          `${baseUrl}/api/v1/project/${editingProject.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(`${baseUrl}/api/v1/add-project`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      await fetchProjects();
      resetForm();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setLoading(true);
      try {
        await axios.delete(`${baseUrl}/api/v1/project/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          
        });
        await fetchProjects();
      } catch (err) {
        setError("Failed to delete project");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      domains: project.domains,
      description: project.description,
    });
    setShowForm(true);
  };

  const addDomain = () => {
    if (domainInput.trim() && !formData.domains.includes(domainInput.trim())) {
      setFormData({
        ...formData,
        domains: [...formData.domains, domainInput.trim()],
      });
      setDomainInput("");
    }
  };

  const removeDomain = (domain) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter((d) => d !== domain),
    });
  };

  const resetForm = () => {
    setFormData({ title: "", domains: [], description: "" });
    setDomainInput("");
    setEditingProject(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="project-management">
        <div className="header">
          <h1>
            <Layout size={28} />
            My Projects
          </h1>
          <button className="add-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <CheckCircle size={20} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={20} />
                Add New Project
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form className="project-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FileText size={18} className="icon" />
                Project Title:
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                maxLength={100}
                placeholder="Enter project title"
              />
            </div>

            <div className="form-group">
              <label>
                <Tag size={18} className="icon" />
                Domains:
              </label>
              <div className="domain-input-container">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Add domain"
                />
                <button type="button" onClick={addDomain}>
                  <Plus size={18} />
                  Add
                </button>
              </div>
              <div className="domains-list">
                {formData.domains.map((domain, index) => (
                  <span key={index} className="domain-tag">
                    <Tag size={14} />
                    {domain}
                    <button type="button" onClick={() => removeDomain(domain)}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <FileText size={18} className="icon" />
                Description:
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={250}
                rows={4}
                placeholder="Enter project description"
              />
              <small>{formData.description.length}/250 characters</small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {editingProject ? "Update Project" : "Add Project"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="projects-container">
          {projects.length === 0 ? (
            <div className="no-projects">No Projects found</div>
          ) : (
            <div className="projects-list">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>
                    <Folder size={20} />
                    {project.title}
                  </h3>
                  <div className="domains-container">
                    {project.domains.map((domain, index) => (
                      <span key={index} className="domain-badge">
                        <Tag size={14} />
                        {domain}
                      </span>
                    ))}
                  </div>
                  {project.description && (
                    <p className="description">
                      <FileText size={16} className="icon" />
                      {project.description}
                    </p>
                  )}
                  <div className="card-actions">
                    <button
                      onClick={() => handleEdit(project)}
                      className="edit-button"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectManagement;
