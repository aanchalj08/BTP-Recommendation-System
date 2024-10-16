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
  fecthReqForTeacher,
  fetchReqForStudent,
  sendBTPReq,
  acceptBTPReq,
  rejectBTPReq,
} = require("../controllers/user");
const { getAllDomains, addDomain } = require("../controllers/domains");

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

const authMiddleware = require("../middleware/auth");

router.route("/btp-requests").post(authMiddleware, sendBTPReq);
router.route("/btp-requests/sent").get(authMiddleware, fetchReqForStudent);
router.route("/btp-requests/incoming").get(authMiddleware, fecthReqForTeacher);
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
router.route("domains").get(getAllDomains);
router.route("domains").post(authMiddleware, addDomain);
router.route("/btp-requests/:id/accept").patch(authMiddleware, acceptBTPReq);
router.route("/btp-requests/:id/reject").patch(authMiddleware, rejectBTPReq);

module.exports = router;
