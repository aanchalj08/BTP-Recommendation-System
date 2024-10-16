const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");

const BTPRequest = sequelize.define(
  "BTPRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
    resumeLink: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    projectIdea: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    facultyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facultyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: "BTPRequest",
  }
);

module.exports = { BTPRequest };
