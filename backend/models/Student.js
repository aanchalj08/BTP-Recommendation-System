const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");
const bcrypt = require("bcrypt");
const { BTPRequest } = require("./BTPRequest");

const Student = sequelize.define(
  "Student",
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
    cgpa: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.0,
        max: 10.0,
      },
    },
    resumeLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
  },
  {
    tableName: "Student",
    hooks: {
      beforeCreate: async (teacher) => {
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(teacher.password, salt);
      },
    },
  }
);

Student.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

Student.prototype.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

module.exports = { Student };
