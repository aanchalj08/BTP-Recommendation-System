const { sequelize } = require("../db/connect");
const { DataTypes } = require("sequelize");

const Publication = sequelize.define(
  "Publication",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Teacher",
        key: "id",
      },
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    issnNumber: DataTypes.STRING,
    authors: DataTypes.JSON,
    title: DataTypes.STRING,
    journalTitle: DataTypes.STRING,
    publicationDate: DataTypes.DATE,
    pageNumbers: DataTypes.STRING,
    citationCount: DataTypes.INTEGER,
    keywords: DataTypes.JSON,
    paperLink: DataTypes.STRING,
    description: DataTypes.TEXT,
    eid: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: "Publication",
  }
);

Publication.associate = (models) => {
  Publication.belongsTo(models.Teacher, { foreignKey: "user_id" });
};

module.exports = { Publication };
