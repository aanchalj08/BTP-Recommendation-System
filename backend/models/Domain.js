const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");

const Domain = sequelize.define(
  "Domain",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const seedDomains = async () => {
  const domains = [
    "AI/ML",
    "Cyber Security",
    "Cloud Computing",
    "Deep Learning",
    "Data Science & Big Data",
    "Computer Networks & Distributed Systems",
    "Software Engineering",
    "Natural Language Processing",
    "Research",
    "Internet of Things",
    "Wireless Communication",
    "Robotics",
    "Development",
    "Blockchain Technology",
    "Bioinformatics",
    "Environmental Engineering",
    "Human-Computer Interaction (HCI)",
    "Networking & Telecommunications",
    "Embedded Systems",
  ];

  for (const domainName of domains) {
    await Domain.findOrCreate({
      where: { name: domainName },
    });
  }
};

module.exports = { Domain, seedDomains };
