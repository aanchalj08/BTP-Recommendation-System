const { Project } = require("../models/Projects");
const { Teacher } = require("../models/Teacher");

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: {
        facultyId: req.user.id,
        isActive: true,
      },
    });
    res.json({ projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

const addProject = async (req, res, next) => {
  try {
    const { title, domains, description } = req.body;

    const project = await Project.create({
      title,
      domains,
      description,
      facultyId: req.user.id,
    });

    res.status(201).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating project", error: error.message });
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, domains, description } = req.body;
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        facultyId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.update({
      title,
      domains,
      description,
    });

    res.json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating project", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        facultyId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.update({ isActive: false });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting project", error: error.message });
  }
};

const getFacultyProjects = async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log(`Attempting to fetch projects for faculty ID: ${facultyId}`);

    const faculty = await Teacher.findOne({
      where: { id: facultyId },
    });

    if (!faculty) {
      console.log(`Faculty not found for ID: ${facultyId}`);
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    console.log(`Faculty found: ${faculty.name}`);

    const projects = await Project.findAll({
      where: {
        facultyId: facultyId,
        isActive: true,
      },
      attributes: ["id", "title", "description", "domains", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    console.log(`Found ${projects.length} projects for faculty`);

    return res.status(200).json({
      success: true,
      data: {
        faculty: {
          id: faculty.id,
          name: faculty.name,
          department: faculty.department,
        },
        projects: projects,
      },
    });
  } catch (error) {
    console.error("Error in getFacultyProjects:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching faculty projects",
      error: error.message,
    });
  }
};

module.exports = {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getFacultyProjects,
};
