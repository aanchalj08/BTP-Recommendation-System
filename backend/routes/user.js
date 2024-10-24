const express = require("express");
const router = express.Router();

const {
  login,
  register,
  dashboard,
  getAllUsers,
  forgotPassword,
  resetPassword,
  refreshPublications,
  studentlogin,
  studentregister,
  fetchReqForTeacher,
  fetchReqForStudent,
  sendBTPReq,
  acceptBTPReq,
  rejectBTPReq,
  updateBTPRequestStatus,
  getStudentData,
  updateStudent,
} = require("../controllers/user");
const { getAllDomains, addDomain } = require("../controllers/domains");
const {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getFacultyProjects,
} = require("../controllers/projects");

const {
  verifyPublication,
  addPublication,
  getUserPublications,
  getPublicationById,
  deletePublication,
  searchPublication,
  getPublications,
  getUserData,
  updateUserData,
} = require("../controllers/publications");

const {
  createGroup,
  sendGroupRequest,
  respondToRequest,
  getGroupRequests,
  fetchGroupDetails,
  isGroupLeader,
} = require("../controllers/group");

const authMiddleware = require("../middleware/auth");

router.route("/btp-requests").post(authMiddleware, sendBTPReq);
router.route("/btp-requests/sent").get(authMiddleware, fetchReqForStudent);
router.route("/btp-requests/incoming").get(authMiddleware, fetchReqForTeacher);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").post(resetPassword);
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users").get(getAllUsers);
router.route("/verify-publication").post(verifyPublication);
router.route("/add-publication").post(authMiddleware, addPublication);
router.route("/get-publications").get(authMiddleware, getUserPublications);
router.route("/publication/:id").get(authMiddleware, getPublicationById);
router
  .route("/delete-publication/:id")
  .delete(authMiddleware, deletePublication);
router.route("/search-users").get(authMiddleware, searchPublication);
router.route("/user-publications/:userId").get(authMiddleware, getPublications);
router.route("/refresh-publications").post(authMiddleware, refreshPublications);
router.route("/teacher/profile").get(authMiddleware, getUserData);
router.route("/teacher/profile").put(authMiddleware, updateUserData);
router.route("/student-login").post(studentlogin);
router.route("/student-register").post(studentregister);
router.route("/domains").get(getAllDomains);
router.route("/domains").post(authMiddleware, addDomain);
router.route("/btp-requests/:id/accept").patch(authMiddleware, acceptBTPReq);
router.route("/btp-requests/:id/reject").patch(authMiddleware, rejectBTPReq);
router
  .route("/btp-requests/:id/status")
  .patch(authMiddleware, updateBTPRequestStatus);
router.route("/my-projects").get(authMiddleware, getProjects);
router.route("/add-project").post(authMiddleware, addProject);
router.route("/project/:id").put(authMiddleware, updateProject);
router.route("/project/:id").delete(authMiddleware, deleteProject);
router
  .route("/faculty/:facultyId/projects")
  .get(authMiddleware, getFacultyProjects);
router.route("/groups").post(authMiddleware, createGroup);
router.route("/group-requests").get(authMiddleware, getGroupRequests);
router.route("/group-requests").post(authMiddleware, sendGroupRequest);
router
  .route("/group-requests/:requestId/respond")
  .post(authMiddleware, respondToRequest);
router.route("/group-details").get(authMiddleware, fetchGroupDetails);
router.route("/check-leader").get(authMiddleware, isGroupLeader);
router.route("/student-data").get(authMiddleware, getStudentData);
router.route("/update-student").put(authMiddleware, updateStudent);

module.exports = router;
