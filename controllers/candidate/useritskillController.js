import Itskill from "../../models/itskillModel.js";
import getTechSkills from "../../models/monogo_query/techSkillModel.js";

import mongoose from "mongoose";
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
    const { skillSearch, version, lastUsed, experienceyear, experiencemonth } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }

    const skillId = await getOrInsertId(skillSearch.toLowerCase());

    const itskill = new Itskill({
      userId,
      skillSearch: skillId,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    });

    await itskill.save();
    res
      .status(201)
      .json({ message: "itskill added successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};

/**
 * @description Edit an existing itskill entry for the authenticated user
 * @route PUT /api/candidate/itskill/edititskill
 * @param {string} _id.required - The MongoDB ID of the itskill document
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 200 - itskill updated successfully
 * @returns {object} 400 - User ID, Skill Search, or itskill ID is required
 * @returns {object} 500 - Error updating itskill
 */
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
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "itskill ID is required" });
    }

    const skillId = await getOrInsertId(skillSearch.toLowerCase());

    const itskill = await Itskill.findOneAndUpdate(
      { _id, userId },
      {
        skillSearch: skillId,
        version,
        lastUsed,
        experienceyear,
        experiencemonth,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "itskill updated successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};

/**
 * @description Retrieve IT skills for the authenticated user.
 * @route GET /api/candidate/itskill/getitskill
 * @access protected
 * @returns {object} 200 - An array of IT skills with details
 * @returns {object} 500 - Error fetching IT skills
 */
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

/**
 * @description Soft delete an IT skill by marking it as deleted for the authenticated user
 * @route DELETE /api/candidate/itskill/deleteitskill
 * @access protected
 * @param {Object} req - Express request object containing userId and itskill ID in the body
 * @param {Object} res - Express response object
 * @returns {Object} 200 - IT skill deleted successfully
 * @returns {Object} 400 - Missing user ID or itskill ID
 * @returns {Object} 500 - Error deleting itskill
 */
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
