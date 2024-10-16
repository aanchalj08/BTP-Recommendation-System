const axios = require("axios");
const { Teacher } = require("../models/Teacher");
const { Publication } = require("../models/Publication");
const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;
const { Op } = require("sequelize");
const { sequelize } = require("../db/connect");

exports.verifyPublication = async (req, res) => {
  const { issnNumber } = req.body;

  try {
    const response = await axios.get(
      `https://api.elsevier.com/content/serial/title/issn/${issnNumber}`,
      {
        headers: {
          "X-ELS-APIKey": SCOPUS_API_KEY,
        },
      }
    );

    if (response.status === 200) {
      res.status(200).json({ verified: true });
    } else {
      res.status(200).json({ verified: false });
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(200).json({ verified: false });
    } else {
      console.error("Error verifying publication:", error);
      res
        .status(500)
        .json({ error: "An error occurred while verifying the publication" });
    }
  }
};

exports.addPublication = async (req, res) => {
  try {
    const userId = req.user.id;
    const publicationData = { ...req.body, user_id: userId };
    const publication = await Publication.create(publicationData);
    res
      .status(201)
      .json({ message: "Publication added successfully", publication });
  } catch (error) {
    console.error("Error adding publication:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the publication" });
  }
};

exports.getUserPublications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { count, rows: publications } = await Publication.findAndCountAll({
      where: { user_id: userId },
      order: [["publicationDate", "DESC"]],
      offset: offset,
      limit: limit,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      publications: publications,
      currentPage: page,
      totalPages: totalPages,
      totalPublications: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user publications",
      error: error.message,
    });
  }
};

exports.getPublicationById = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: "Publication not found",
      });
    }
    res.status(200).json({
      success: true,
      publication: publication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching publication",
      error: error.message,
    });
  }
};

exports.deletePublication = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const userId = req.user.id;
    const publication = await Publication.findOne({
      where: {
        id: publicationId,
        user_id: userId,
      },
    });
    if (!publication) {
      return res.status(404).json({
        success: false,
        message:
          "Publication not found or you don't have permission to delete it",
      });
    }
    await publication.destroy();
    res.status(200).json({
      success: true,
      message: "Publication deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting publication",
      error: error.message,
    });
  }
};

exports.searchPublication = async (req, res) => {
  try {
    const { name, department, domain } = req.query;
    if (!name && !department && !domain) {
      return res.status(400).json({
        message: "Name, department, or domain query parameter is required",
      });
    }

    let whereClause = {};
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (department) {
      whereClause.department = department;
    }
    if (domain) {
      console.log(domain);
      const domainList = domain.split(",").map((d) => decodeURIComponent(d));
      whereClause.domains = {
        [Op.or]: domainList.map((d) =>
          sequelize.literal(
            `JSON_CONTAINS(domains, ${sequelize.escape(JSON.stringify(d))})`
          )
        ),
      };
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    const users = await Teacher.findAll({
      where: whereClause,
      attributes: ["id", "name", "department", "email", "domains"],
    });

    console.log(`Found ${users.length} users matching the criteria`);
    return res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPublications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching publications for user ID: ${userId}`);

    const publications = await Publication.findAll({
      where: { user_id: userId },
      attributes: ["title", "publicationDate", "id"],
      order: [["publicationDate", "DESC"]],
    });

    console.log(`Found ${publications.length} publications`);
    res.json({ publications });
  } catch (error) {
    console.error("Error fetching user publications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }
    console.log("Teacher found");
    console.log(teacher);
    res.json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateUserData = async (req, res) => {
  const { name, email, department, authorID, domains } = req.body;
  const teacherFields = {};
  if (name) teacherFields.name = name;
  if (email) teacherFields.email = email;
  if (department) teacherFields.department = department;
  if (authorID) teacherFields.authorID = authorID;
  if (domains && Array.isArray(domains)) teacherFields.domains = domains;

  try {
    const [updatedRowsCount] = await Teacher.update(teacherFields, {
      where: { id: req.user.id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ msg: "Teacher not found" });
    }
    const updatedTeacher = await Teacher.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({
      teacher: updatedTeacher,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
