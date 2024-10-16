require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db/connect");
const mainRouter = require("./routes/user");
const {
  forgotPassword,
  resetPassword,
  refreshPublications,
} = require("./controllers/user");
const authMiddleware = require("./middleware/auth");
const {
  addPublication,
  verifyPublication,
  getUserPublications,
  getPublicationById,
  deletePublication,
  searchPublication,
  getPublications,
  getUserData,
  updateUserData,
} = require("./controllers/publications");
const { getAllDomains, addDomain } = require("./controllers/domains");

const app = express();
const port = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

app.use(express.json());
app.use(
  cors({
    origin: [BASE_URL],
    methods: "GET,POST,DELETE,PUT,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.post("/api/v1/forgot-password", forgotPassword);
app.post("/api/v1/reset-password/:resetToken", resetPassword);
app.post("/api/v1/verify-publication", verifyPublication);
app.post("/api/v1/add-publication", authMiddleware, addPublication);
app.get("/api/v1/get-publications", authMiddleware, getUserPublications);
app.get("/api/v1/publication/:id", authMiddleware, getPublicationById);
app.delete("/api/v1/delete-publication/:id", authMiddleware, deletePublication);
app.get("/api/v1//search-users", authMiddleware, searchPublication);
app.get("/api/v1/user-publications/:userId", authMiddleware, getPublications);
app.post("/api/v1/refresh-publications", authMiddleware, refreshPublications);
app.get("/api/v1/teacher/profile", authMiddleware, getUserData);
app.put("/api/v1/teacher/profile", authMiddleware, updateUserData);
app.get("/api/v1/domains", getAllDomains);
app.post("/api/v1/domains", authMiddleware, addDomain);

app.use("/api/v1", mainRouter);

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {});
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.log(error);
  }
};

start();
