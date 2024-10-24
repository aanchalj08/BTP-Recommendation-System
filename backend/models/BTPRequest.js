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
    projectIdea: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    facultyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Teacher",
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Group",
        key: "id",
      },
    },
  },
  {
    tableName: "BTPRequest",
  }
);

module.exports = { BTPRequest };
