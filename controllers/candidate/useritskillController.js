import Itskill from "../../models/itskillModel.js";
import getTechSkills from "../../models/monogo_query/techSkillModel.js";
import Otherskill from "../../models/OtherSkillModel.js";
import list_non_tech_skill from "../../models/monogo_query/nonTechSkillModel.js";
import User from "../../models/userModel.js";
import { emailQueue } from "../../queues/emailQueue.js";
import mongoose from "mongoose";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
export const getOrInsertId = async (value) => {
  try {
    // 1. Normalize input (optional)
    const trimmedValue = value.trim();

    // 2. Check if skill already exists
    const existingSkill = await getTechSkills.findOne({ name: trimmedValue });

    if (existingSkill) {
      return existingSkill._id;
    }

    // 3. If not found, insert new skill
    const newSkill = await getTechSkills.create({
      name: trimmedValue,
      is_del: 0,
      is_active: 0,
      flag: 1,
    });

    return newSkill._id;
  } catch (error) {
    console.error("DB Error in getOrInsertId →", error.message);
    throw error;
  }
};

export const giveIDgetname = async (value) => {
  try {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return "Unknown Skill";
    }

    const skill = await getTechSkills.findById(
      new mongoose.Types.ObjectId(value)
    );

    if (!skill) return "Unknown Skill";

    const name = skill.name || "Unknown Skill";
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (error) {
    console.error("DB Error in giveIDgetname →", error.message);
    throw error;
  }
};

export const giveIDgetnameForOtherSkill = async (value) => {
  try {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return "Unknown Skill";
    }

    const skill = await list_non_tech_skill.findById(
      new mongoose.Types.ObjectId(value)
    );

    if (!skill) return "Unknown Skill";

    const name = skill.name || "Unknown Skill";
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (error) {
    console.error("DB Error in giveIDgetname →", error.message);
    throw error;
  }
};

export const getOrInsertIdForOtherSkill = async (value) => {
  try {
    // 1. Normalize input (optional)
    const trimmedValue = value.trim();

    // 2. Check if skill already exists
    const existingSkill = await list_non_tech_skill.findOne({
      name: trimmedValue,
    });

    if (existingSkill) {
      return existingSkill._id;
    }

    // 3. If not found, insert new skill
    const newSkill = await list_non_tech_skill.create({
      name: trimmedValue,
      is_del: 0,
      is_active: 0,
      flag: 1,
    });

    return newSkill._id;
  } catch (error) {
    console.error("DB Error in getOrInsertId →", error.message);
    throw error;
  }
};

/**
 * @description Add a new itskill entry for the authenticated user
 * @route POST /api/candidate/itskill/additskill
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 201 - itskill added successfully
 * @returns {object} 400 - User ID or Skill Search is required
 * @returns {object} 500 - Error adding itskill
 */
export const additskill = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      skillSearch,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!skillSearch?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill Search is required",
      });
    }

    const candidate = await CandidateDetails.findOne({ userId }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate doesn't exist",
      });
    }

    if (!candidate.dob) {
      return res.status(400).json({
        success: false,
        message: "Candidate date of birth is missing",
      });
    }

    const dob = new Date(candidate.dob);

    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate date of birth",
      });
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() >= dob.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    const years = Number(experienceyear) || 0;
    const months = Number(experiencemonth) || 0;

    if (years < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience year cannot be negative",
      });
    }

    if (months < 0 || months > 11) {
      return res.status(400).json({
        success: false,
        message: "Experience month must be between 0 and 11",
      });
    }

    const totalExperience = years + months / 12;

    const maxAllowedExperience = age - 18;

    if (totalExperience > maxAllowedExperience) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed experience for a ${age}-year-old candidate is ${maxAllowedExperience.toFixed(
          1
        )} years`,
      });
    }

    const normalizedSkill = skillSearch.trim().toLowerCase();

    const skillId = await getOrInsertId(normalizedSkill);

    const existingSkill = await Itskill.exists({
      userId,
      skillSearch: skillId,
      is_del: false
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists",
      });
    }

    const userdtl = await User.findById(userId).lean();

    if (!userdtl) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const itskill = new Itskill({
      userId,
      skillSearch: skillId,
      version,
      lastUsed,
      experienceyear: years,
      experiencemonth: months,
    });

    await itskill.save();

    try {
      await emailQueue.add('itskill_added', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Itskill added successfully",
    });
  } catch (error) {
    console.error("Error adding itskill:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding itskill",
      error: error.message,
    });
  }
};


export const edititskill = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      _id,
      skillSearch,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Itskill ID is required",
      });
    }

    if (!skillSearch?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill Search is required",
      });
    }

    // ---------------- Candidate Validation ----------------

    const candidate = await CandidateDetails.findOne({ userId }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate doesn't exist",
      });
    }

    if (!candidate.dob) {
      return res.status(400).json({
        success: false,
        message: "Candidate date of birth is missing",
      });
    }

    const dob = new Date(candidate.dob);

    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate date of birth",
      });
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() >= dob.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    const years = Number(experienceyear) || 0;
    const months = Number(experiencemonth) || 0;

    if (years < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience year cannot be negative",
      });
    }

    if (months < 0 || months > 11) {
      return res.status(400).json({
        success: false,
        message: "Experience month must be between 0 and 11",
      });
    }

    const totalExperience = years + months / 12;

    const maxAllowedExperience = age - 18;

    if (totalExperience > maxAllowedExperience) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed experience for a ${age}-year-old candidate is ${maxAllowedExperience.toFixed(
          1
        )} years.`,
      });
    }

    // ---------------- Skill Validation ----------------

    const normalizedSkill = skillSearch.trim().toLowerCase();

    const skillId = await getOrInsertId(normalizedSkill);

    // Prevent duplicate skills except this record
    const duplicateSkill = await Itskill.exists({
      userId,
      skillSearch: skillId,
      _id: { $ne: _id },
    });

    if (duplicateSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists",
      });
    }

    // ---------------- Update ----------------

    const itskill = await Itskill.findOneAndUpdate(
      {
        _id,
        userId,
      },
      {
        skillSearch: skillId,
        version,
        lastUsed,
        experienceyear: years,
        experiencemonth: months,
      },
      {
        new: true,
      }
    );

    if (!itskill) {
      return res.status(404).json({
        success: false,
        message: "Itskill record not found",
      });
    }

    // ---------------- User ----------------

    const userdtl = await User.findById(userId).lean();

    if (!userdtl) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------- Email ----------------

    try {
      await emailQueue.add('itskill_updated', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Itskill updated successfully",
      data: itskill,
    });
  } catch (error) {
    console.error("Error updating itskill:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating itskill",
      error: error.message,
    });
  }
};


export const getitskill = async (req, res) => {
  try {
    const userId = req.userId;
    //where is_del is false
    const itskills = await Itskill.find({ userId, is_del: false });

    // Use Promise.all to wait for all skill names to be fetched
    const formatteditskills = await Promise.all(
      itskills.map(async (itskill) => ({
        _id: itskill._id,
        skillSearch: await giveIDgetname(itskill.skillSearch), // convert ID to name
        version: itskill.version,
        lastUsed: itskill.lastUsed,
        experienceyear: itskill.experienceyear,
        experiencemonth: itskill.experiencemonth,
      }))
    );

    res.status(200).json({ success: true, data: formatteditskills });
  } catch (error) {
    console.error("Error fetching itskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching itskills", error: error.message });
  }
};


export const deleteitskill = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "itskill ID is required" });
    }

    //update is_del to false
    const itskill = await Itskill.findOneAndUpdate(
      { _id, userId },
      { is_del: true, updatedAt: Date.now() },
      { new: true }
    );

    const userdtl = await User.findById(userId);

    if (userdtl) {
      await emailQueue.add('itskill_deleted', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

    res
      .status(200)
      .json({ message: "itskill deleted successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};


export const addOtherSkill = async (req, res) => {
  try {
    const userId = req.userId;
    const { skillSearch, experienceyear, experiencemonth } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!skillSearch?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill Search is required",
      });
    }

    // ---------------- Candidate Validation ----------------

    const candidate = await CandidateDetails.findOne({ userId }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate doesn't exist",
      });
    }

    if (!candidate.dob) {
      return res.status(400).json({
        success: false,
        message: "Candidate date of birth is missing.",
      });
    }

    const dob = new Date(candidate.dob);

    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate date of birth.",
      });
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() >= dob.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    const years = Number(experienceyear) || 0;
    const months = Number(experiencemonth) || 0;

    if (years < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience year cannot be negative.",
      });
    }

    if (months < 0 || months > 11) {
      return res.status(400).json({
        success: false,
        message: "Experience month must be between 0 and 11.",
      });
    }

    const totalExperience = years + months / 12;
    const maxAllowedExperience = age - 18;

    if (totalExperience > maxAllowedExperience) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed experience for a ${age}-year-old candidate is ${maxAllowedExperience.toFixed(
          1
        )} years.`,
      });
    }

    // ---------------- Skill ----------------

    const normalizedSkill = skillSearch.trim().toLowerCase();

    const skillId = await getOrInsertIdForOtherSkill(normalizedSkill);

    const exists = await Otherskill.exists({
      userId,
      skillSearch: skillId,
      is_del: false,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists.",
      });
    }

    // ---------------- User ----------------

    const userdtl = await User.findById(userId).lean();

    if (!userdtl) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ---------------- Save ----------------

    const otherskill = new Otherskill({
      userId,
      skillSearch: skillId,
      experienceyear: years,
      experiencemonth: months,
    });

    await otherskill.save();

    // ---------------- Email ----------------

    try {
      await emailQueue.add('otherskill_added', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Otherskill added successfully",
    });
  } catch (error) {
    console.error("Error adding otherskill:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding otherskill",
      error: error.message,
    });
  }
};


export const editotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      _id,
      skillSearch,
      experienceyear,
      experiencemonth,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Other Skill ID is required",
      });
    }

    if (!skillSearch?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill Search is required",
      });
    }

    // ---------------- Candidate Validation ----------------

    const candidate = await CandidateDetails.findOne({ userId }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate doesn't exist",
      });
    }

    if (!candidate.dob) {
      return res.status(400).json({
        success: false,
        message: "Candidate date of birth is missing.",
      });
    }

    const dob = new Date(candidate.dob);

    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate date of birth.",
      });
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() >= dob.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    const years = Number(experienceyear) || 0;
    const months = Number(experiencemonth) || 0;

    if (years < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience year cannot be negative.",
      });
    }

    if (months < 0 || months > 11) {
      return res.status(400).json({
        success: false,
        message: "Experience month must be between 0 and 11.",
      });
    }

    const totalExperience = years + months / 12;
    const maxAllowedExperience = age - 18;

    if (totalExperience > maxAllowedExperience) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed experience for a ${age}-year-old candidate is ${maxAllowedExperience.toFixed(
          1
        )} years.`,
      });
    }

    // ---------------- Skill Validation ----------------

    const normalizedSkill = skillSearch.trim().toLowerCase();

    const skillId = await getOrInsertIdForOtherSkill(normalizedSkill);

    const duplicateSkill = await Otherskill.exists({
      userId,
      skillSearch: skillId,
      _id: { $ne: _id },
    });

    if (duplicateSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists.",
      });
    }

    // ---------------- Update ----------------

    const otherskill = await Otherskill.findOneAndUpdate(
      {
        _id,
        userId,
      },
      {
        skillSearch: skillId,
        experienceyear: years,
        experiencemonth: months,
      },
      {
        new: true,
      }
    );

    if (!otherskill) {
      return res.status(404).json({
        success: false,
        message: "Other Skill not found.",
      });
    }

    // ---------------- User ----------------

    const userdtl = await User.findById(userId).lean();

    if (!userdtl) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ---------------- Email ----------------

    try {
      await emailQueue.add('otherskill_updated', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Other Skill updated successfully",
      data: otherskill,
    });
  } catch (error) {
    console.error("Error updating Other Skill:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating Other Skill",
      error: error.message,
    });
  }
};

/**
 * @description Retrieve Other skills for the authenticated user.
 * @route GET /api/candidate/itskill/getotherskill
 * @access protected
 * @returns {object} 200 - An array of Other skills with details
 * @returns {object} 500 - Error fetching other skills
 */
export const getotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    //where is_del is false
    const otherskills = await Otherskill.find({ userId, is_del: false });

    // Use Promise.all to wait for all skill names to be fetched
    const formattedotherskills = await Promise.all(
      otherskills.map(async (otherskill) => ({
        _id: otherskill._id,
        skillSearch: await giveIDgetnameForOtherSkill(otherskill.skillSearch), // convert ID to name
        version: otherskill.version,
        lastUsed: otherskill.lastUsed,
        experienceyear: otherskill.experienceyear,
        experiencemonth: otherskill.experiencemonth,
      }))
    );

    res.status(200).json({ success: true, data: formattedotherskills });
  } catch (error) {
    console.error("Error fetching otherskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching otherskills", error: error.message });
  }
};

/**
 * @description Soft delete an Other skill by marking it as deleted for the authenticated user
 * @route DELETE /api/candidate/itskill/deleteotherskill
 * @access protected
 * @param {Object} req - Express request object containing userId and otherskill ID in the body
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Other skill deleted successfully
 * @returns {Object} 400 - Missing user ID or otherskill ID
 * @returns {Object} 500 - Error deleting itskill
 */
export const deleteotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    console.log(userId);
    console.log("Request body:", req.body);
    console.log("Here Id is : ", _id);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "otherskill ID is required" });
    }

    //update is_del to false
    const otherskill = await Otherskill.findOneAndUpdate(
      { _id, userId },
      { is_del: true, updatedAt: Date.now() },
      { new: true }
    );
    const userdtl = await User.findById(userId);

    if (userdtl) {
      await emailQueue.add('otherskill_deleted', {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Other skill deleted successfully", success: true });
  } catch (error) {
    console.error("Error adding other skill:", error);
    res
      .status(500)
      .json({ message: "Error adding other skill", error: error.message });
  }
};
