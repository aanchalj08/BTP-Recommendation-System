const { Domain } = require("../models/Domain");

const getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll();
    res.json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ message: "Error fetching domains" });
  }
};

const addDomain = async (req, res) => {
  try {
    const { name } = req.body;
    const newDomain = await Domain.create({ name });
    res.status(201).json(newDomain);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding domain", error: error.message });
  }
};

module.exports = {
  getAllDomains,
  addDomain,
};
