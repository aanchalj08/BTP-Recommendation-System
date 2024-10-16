require("dotenv").config();
const jwt = require("jsonwebtoken");
const { BTPRequest } = require("../models/BTPRequest");
const { Teacher } = require("../models/Teacher");
const { Student } = require("../models/Student");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const {
  fetchAndSavePublications,
  validateAuthorID,
} = require("./scopusIntegration");
const jwtSecret = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  try {
    let foundUser = await Teacher.findOne({ where: { email: email } });
    if (foundUser) {
      const isMatch = await foundUser.comparePassword(password);

      if (isMatch) {
        const token = jwt.sign(
          { id: foundUser.id, name: foundUser.name },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        return res
          .status(200)
          .json({ msg: "User logged in successfully", token });
      } else {
        return res.status(400).json({ msg: "Bad password" });
      }
    } else {
      return res.status(400).json({ msg: "Bad credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const studentlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  try {
    let foundUser = await Student.findOne({ where: { email: email } });
    if (foundUser) {
      const isMatch = await foundUser.comparePassword(password);

      if (isMatch) {
        const token = jwt.sign(
          { id: foundUser.id, name: foundUser.name },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        return res
          .status(200)
          .json({ msg: "User logged in successfully", token });
      } else {
        return res.status(400).json({ msg: "Bad password" });
      }
    } else {
      return res.status(400).json({ msg: "Bad credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `Hello, ${req.user.name}`,
    secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
  });
};

const getAllUsers = async (req, res) => {
  try {
    let users = await Teacher.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const register = async (req, res) => {
  try {
    let { username, email, password, department, authorID, domains } = req.body;

    if (!username || !email || !password || !domains.length) {
      return res
        .status(400)
        .json({ msg: "Please add all values in the request body" });
    }

    let foundUser = await Teacher.findOne({ where: { email: email } });
    if (foundUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const isValidAuthorID = await validateAuthorID(authorID);
    if (!isValidAuthorID) {
      return res.status(400).json({ msg: "Invalid Author ID" });
    }

    const person = await Teacher.create({
      name: username,
      email: email,
      password: password,
      department: department,
      authorID: authorID,
      domains: domains,
    });

    await fetchAndSavePublications(person, authorID);

    const token = jwt.sign(
      { id: person.id, name: person.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const welcomeMessage = `
    Dear Dr. ${username},
    Welcome to the LNMIIT Research Portal!
    Thank you for registering with us. Your account is now active, and you can start exploring the platform.
    We're excited to have you on board and look forward to seeing your contributions to the LNMIIT research community!
    Best regards,
    The LNMIIT Research Portal Team
        `;

    try {
      await sendEmail({
        email: email,
        subject: "Welcome to LNMIIT Research Portal",
        message: welcomeMessage,
      });
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    return res.status(201).json({ person, token });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const studentregister = async (req, res) => {
  try {
    let { username, email, password, department } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please add all values in the request body" });
    }

    if (!email.endsWith("@lnmiit.ac.in")) {
      return res
        .status(400)
        .json({ msg: "Please enter your college email id (@lnmiit.ac.in)" });
    }

    let foundUser = await Student.findOne({ where: { email: email } });
    if (foundUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const person = await Student.create({
      name: username,
      email: email,
      password: password,
      department: department,
    });

    const token = jwt.sign(
      { id: person.id, name: person.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    return res.status(201).json({ person, token });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email, userType } = req.body;

  if (!email || !userType) {
    return res.status(400).json({ msg: "Please provide email and user type" });
  }

  try {
    const UserModel = userType === "teacher" ? Teacher : Student;
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 10 * 60 * 1000,
    });

    const resetUrl = `${BASE_URL}/reset-password/${resetToken}&userType=${userType}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      await user.update({
        resetPasswordToken: null,
        resetPasswordExpire: null,
      });

      return res.status(500).json({ msg: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    let { resetToken } = req.params;
    const { password } = req.body;
    let { userType } = req.query;

    if (!userType && resetToken.includes("&userType=")) {
      [resetToken, userType] = resetToken.split("&userType=");
    }

    if (!resetToken || !password || !userType) {
      return res.status(400).json({ msg: "Missing required parameters" });
    }

    const UserModel = userType === "teacher" ? Teacher : Student;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await UserModel.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: userType },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const refreshPublications = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Teacher.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.authorID) {
      return res
        .status(400)
        .json({ success: false, message: "User does not have an author ID" });
    }

    await fetchAndSavePublications(user, user.authorID);

    res
      .status(200)
      .json({ success: true, message: "Publications refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing publications:", error);
    res
      .status(500)
      .json({ success: false, message: "Error refreshing publications" });
  }
};

const sendBTPReq = async (req, res) => {
  try {
    const { facultyName, facultyEmail, resumeLink, projectIdea } = req.body;
    const studentId = req.user.id;

    // Input validation
    if (!facultyName || !facultyEmail || !resumeLink) {
      return res.status(400).json({
        message: "Faculty name, email, and resume link are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(facultyEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    try {
      new URL(resumeLink);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid resume link format",
      });
    }

    if (projectIdea && projectIdea.split(" ").length > 80) {
      return res.status(400).json({
        message: "Project idea cannot exceed 80 words",
      });
    }

    const faculty = await Teacher.findOne({
      where: { email: facultyEmail },
    });

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found with the provided email",
      });
    }

    // Check for existing request
    const existingRequest = await BTPRequest.findOne({
      where: {
        studentId,
        facultyId: faculty.id,
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent a request to this faculty",
      });
    }

    // Create new request
    const newRequest = await BTPRequest.create({
      studentId,
      facultyId: faculty.id,
      facultyName,
      facultyEmail,
      resumeLink,
      projectIdea,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating BTP request:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "A request with these details already exists",
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Invalid student ID or faculty ID",
      });
    }

    res.status(500).json({
      message: "An unexpected error occurred while creating the BTP request",
      error: error.message,
    });
  }
};
const fetchReqForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const sentRequests = await BTPRequest.findAll({
      where: { studentId },
      include: [
        {
          model: Teacher,
          attributes: ["name", "department"],
        },
      ],
      attributes: [
        "id",
        "status",
        "facultyName",
        "facultyEmail",
        "resumeLink",
        "projectIdea",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(sentRequests);
  } catch (error) {
    console.error("Error fetching sent BTP requests:", error);
    res.status(500).json({ message: "Failed to fetch sent BTP requests" });
  }
};

const fecthReqForTeacher = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const incomingRequests = await BTPRequest.findAll({
      where: { facultyId },
      include: [
        {
          model: Student,
          attributes: ["name", "email", "department"],
        },
      ],
      attributes: [
        "id",
        "status",
        "resumeLink",
        "projectIdea",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(incomingRequests);
  } catch (error) {
    console.error("Error fetching incoming BTP requests:", error);
    res.status(500).json({ message: "Failed to fetch incoming BTP requests" });
  }
};

const acceptBTPReq = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyId = req.user.id;

    const acceptedRequestsCount = await BTPRequest.count({
      where: { facultyId, status: "accepted" },
    });

    if (acceptedRequestsCount >= 10) {
      return res.status(400).json({
        message: "Limit exceeded. Only 10 requests are allowed to be accepted.",
      });
    }

    const request = await BTPRequest.findOne({
      where: { id, facultyId },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or unauthorized",
      });
    }

    await request.update({ status: "accepted" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error accepting BTP request:", error);
    res.status(500).json({ message: "Failed to accept BTP request" });
  }
};

const rejectBTPReq = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyId = req.user.id;

    const request = await BTPRequest.findOne({
      where: { id, facultyId },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or unauthorized",
      });
    }

    await request.update({ status: "rejected" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error rejecting BTP request:", error);
    res.status(500).json({ message: "Failed to reject BTP request" });
  }
};

module.exports = {
  login,
  register,
  dashboard,
  getAllUsers,
  forgotPassword,
  resetPassword,
  refreshPublications,
  studentlogin,
  studentregister,
  fetchReqForStudent,
  fecthReqForTeacher,
  sendBTPReq,
  acceptBTPReq,
  rejectBTPReq,
};
