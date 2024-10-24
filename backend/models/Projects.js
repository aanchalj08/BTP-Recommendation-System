const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");

const Project = sequelize.define(
  "Project",
  {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    domains: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue("domains");
        return rawValue || [];
      },
      set(value) {
        this.setDataValue("domains", value);
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 250],
      },
    },
    facultyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Teacher",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "Project",
  }
);

Project.associate = (models) => {
  Project.belongsTo(models.Teacher, { foreignKey: "facultyId" });
};

const { Teacher } = require("./Teacher");
Teacher.hasMany(Project, { foreignKey: "facultyId" });
Project.belongsTo(Teacher, { foreignKey: "facultyId" });

module.exports = { Project };
