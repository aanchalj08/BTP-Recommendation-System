const { Group, GroupMember, GroupRequest } = require("../models/Group");
const { Student } = require("../models/Student");
const { Op } = require("sequelize");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const studentId = req.user.id;

    const existingMembership = await GroupMember.findOne({
      where: { studentId },
    });

    if (existingMembership) {
      return res.status(400).json({ msg: "You are already in a group" });
    }

    const group = await Group.create({
      name,
      leaderId: studentId,
    });

    await GroupMember.create({
      studentId,
      groupId: group.id,
    });

    res.status(201).json({ group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const sendGroupRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const fromStudentId = req.user.id;

    const recipient = await Student.findOne({
      where: { email },
    });

    if (!recipient) {
      return res.status(400).json({ msg: "Recipient not found" });
    }

    const toStudentId = recipient.id;

    const existingRequest = await GroupRequest.findOne({
      where: {
        fromStudentId,
        toStudentId,
        status: {
          [Op.or]: ["pending", "accepted"],
        },
      },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ msg: "A request has already been sent to this student" });
    }

    const senderGroup = await GroupMember.findOne({
      where: { studentId: fromStudentId },
      include: [Group],
    });

    if (!senderGroup) {
      return res
        .status(400)
        .json({ msg: "You must be in a group to send requests" });
    }

    if (senderGroup.Group.leaderId !== fromStudentId) {
      return res
        .status(400)
        .json({ msg: "Only group leader can send requests" });
    }

    const memberCount = await GroupMember.count({
      where: { groupId: senderGroup.groupId },
    });

    if (memberCount >= 5) {
      return res.status(400).json({ msg: "Group has reached maximum size" });
    }

    const recipientGroup = await GroupMember.findOne({
      where: { studentId: toStudentId },
    });

    if (recipientGroup) {
      return res.status(400).json({ msg: "Student is already in a group" });
    }

    const request = await GroupRequest.create({
      fromStudentId,
      toStudentId,
      groupId: senderGroup.groupId,
    });

    res.status(201).json({ request });
  } catch (error) {
    console.error("Error sending group request:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accept } = req.body;
    const studentId = req.user.id;

    const request = await GroupRequest.findOne({
      where: {
        id: requestId,
        toStudentId: studentId,
        status: "pending",
      },
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (accept) {
      const existingMembership = await GroupMember.findOne({
        where: { studentId },
      });

      if (existingMembership) {
        await request.update({ status: "rejected" });
        return res.status(400).json({ msg: "You are already in a group" });
      }

      const groupMemberCount = await GroupMember.count({
        where: { groupId: request.groupId },
      });

      if (groupMemberCount >= 4) {
        await request.update({ status: "rejected" });
        return res.status(400).json({ msg: "The group already has 4 members" });
      }

      await GroupMember.create({
        studentId,
        groupId: request.groupId,
      });

      await request.update({ status: "accepted" });
    } else {
      await request.update({ status: "rejected" });
    }

    res.status(200).json({ request });
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getGroupRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [sent, received] = await Promise.all([
      GroupRequest.findAll({
        where: { fromStudentId: studentId },
        include: [
          { model: Student, as: "Receiver", attributes: ["name", "email"] },
        ],
      }),
      GroupRequest.findAll({
        where: { toStudentId: studentId, status: "pending" },
        include: [
          { model: Student, as: "Sender", attributes: ["name", "email"] },
          { model: Group },
        ],
      }),
    ]);

    res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const fetchGroupDetails = async (req, res) => {
  try {
    const studentId = req.user.id;

    const groupMembership = await GroupMember.findOne({
      where: { studentId },
      include: [Group],
    });

    if (!groupMembership) {
      return res.status(404).json({ msg: "You are not part of any group" });
    }

    const groupId = groupMembership.groupId;

    const group = await Group.findOne({
      where: { id: groupId },
      attributes: ["name"],
    });

    const memberCount = await GroupMember.count({
      where: { groupId },
    });

    const groupMembers = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: Student, attributes: ["id", "name", "email"] }],
    });

    const memberDetails = groupMembers.map((member) => ({
      id: member.Student.id,
      name: member.Student.name,
      email: member.Student.email,
    }));

    res.status(200).json({
      groupName: group.name,
      memberCount,
      members: memberDetails,
      groupId,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const isGroupLeader = async (req, res) => {
  try {
    const studentId = req.user.id;

    const group = await Group.findOne({
      where: { leaderId: studentId },
    });

    if (group) {
      return res.status(200).json({ isLeader: true });
    } else {
      return res.status(200).json({ isLeader: false });
    }
  } catch (error) {
    console.error("Error checking group leader status:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  createGroup,
  sendGroupRequest,
  respondToRequest,
  getGroupRequests,
  fetchGroupDetails,
  isGroupLeader,
};
