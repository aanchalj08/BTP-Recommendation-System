const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connect");
const { Student } = require("./Student");
const {BTPRequest} = require("./BTPRequest");

const Group = sequelize.define(
  "Group",
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Student",
        key: "id",
      },
    },
  },
  {
    tableName: "Group",
  }
);

const GroupMember = sequelize.define(
  "GroupMember",
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Student",
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Group",
        key: "id",
      },
    },
  },
  {
    tableName: "GroupMember",
  }
);

const GroupRequest = sequelize.define(
  "GroupRequest",
  {
    fromStudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Student",
        key: "id",
      },
    },
    toStudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Student",
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Group",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "GroupRequest",
  }
);

// Associations
// Associations
Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });

Student.hasMany(GroupMember, { foreignKey: "studentId" });
GroupMember.belongsTo(Student, { foreignKey: "studentId" });

Student.hasMany(GroupRequest, {
  foreignKey: "fromStudentId",
  as: "SentRequests",
});
Student.hasMany(GroupRequest, {
  foreignKey: "toStudentId",
  as: "ReceivedRequests",
});
GroupRequest.belongsTo(Student, { foreignKey: "fromStudentId", as: "Sender" });
GroupRequest.belongsTo(Student, { foreignKey: "toStudentId", as: "Receiver" });

Group.hasMany(GroupRequest, { foreignKey: "groupId", as: "Requests" });
GroupRequest.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(BTPRequest, { foreignKey: "groupId", as: "BTPRequests" });
BTPRequest.belongsTo(Group, { foreignKey: "groupId", as: "Group" });

module.exports = { Group, GroupMember, GroupRequest };
