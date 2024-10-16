const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");
const bcrypt = require("bcrypt");
const { BTPRequest } = require("./BTPRequest");

const Teacher = sequelize.define(
  "Teacher",
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    domains: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue("domains");
        return rawValue || [];
      },
      set(value) {
        this.setDataValue("domains", value);
      },
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
  },
  {
    tableName: "Teacher",
    hooks: {
      beforeCreate: async (teacher) => {
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(teacher.password, salt);
      },
    },
  }
);

Teacher.hasMany(BTPRequest, { foreignKey: "facultyId" });
BTPRequest.belongsTo(Teacher, { foreignKey: "facultyId" });

Teacher.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

Teacher.prototype.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

module.exports = { Teacher };
