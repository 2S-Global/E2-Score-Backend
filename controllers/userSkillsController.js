
import jwt from "jsonwebtoken";

// Register a new user
import UserSkills from "../models/userSkillsModel.js"; // Ensure correct path to your model

export const addUserSkills = async (req, res) => {
    try {
        const user_id = req.userId;
        //check user exists
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const { skill_name, software_version, last_used_year, experience_year, experience_month } = req.body;

        // Validate required fields
        if (!skill_name || !software_version) {
            return res.status(400).json({ message: "Skill name and software version are required" });
        }


        // Create a new skill entry
        const newSkill = new UserSkills({
            user_id,
            skill_name,
            software_version,
            last_used_year,
            experience_year,
            experience_month
        });

        await newSkill.save();

        res.status(201).json({ message: "Skill added successfully", skill: newSkill });
    } catch (error) {
        res.status(500).json({ message: "Error adding skill", error: error.message });
    }
};



// Login a user
export const listUserSkills = async (req, res) => {
    try {
        const user_id = req.userId;

        // Validate if user_id is provided
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch skills for the given user_id where is_del is false
        const skills = await UserSkills.find({ user_id, is_del: false });

        if (!skills.length) {
            return res.status(404).json({ message: "No skills found for this user" });
        }

        res.status(200).json({
            success: true,
            message: "User skills retrieved successfully",
            data: skills,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user skills", error: error.message });
    }
};


export const deleteUserSkill = async (req, res) => {
    try {
        const user_id = req.userId;
        const { skill_id } = req.body;

        // Validate required fields
        if (!user_id || !skill_id) {
            return res.status(400).json({ message: "User ID and Skill ID are required" });
        }

        // Find and update the skill (soft delete)
        const skill = await UserSkills.findOneAndUpdate(
            { _id: skill_id, user_id, is_del: false }, // Only update if the skill belongs to the user and is not already deleted
            { is_del: true, updatedAt: Date.now() },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({ message: "Skill not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully",
            data: skill,
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting skill", error: error.message });
    }
};