import UserEmployment from "../models/userEmploymentModel.js";
import jwt from "jsonwebtoken";

// Register a new user
export const addUserEmployment = async (req, res) => {
    try {
        const {
            user_id,
            is_current_employment,
            employment_type,
            total_experience_year,
            total_experience_month,
            company_name,
            job_title,
            joining_year,
            joining_month,
            joining_details
        } = req.body;

        // Validate required fields
        if (!user_id || !is_current_employment || !employment_type || !company_name) {
            return res.status(400).json({ message: "User ID, current employment status, employment type, and company name are required" });
        }

        // Create a new employment record
        const newEmployment = new UserEmployment({
            user_id,
            is_current_employment,
            employment_type,
            total_experience_year,
            total_experience_month,
            company_name,
            job_title,
            joining_year,
            joining_month,
            joining_details
        });

        // Save to database
        await newEmployment.save();

        res.status(201).json({
            success: true,
            message: "Employment record added successfully",
            data: newEmployment
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding employment record", error: error.message });
    }
};



export const listUserEmployment = async (req, res) => {
    try {
        const { user_id } = req.body;

        // Validate required fields
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch all employment records for the given user where is_del is false
        const employmentRecords = await UserEmployment.find({ user_id, is_del: false });

        if (!employmentRecords.length) {
            return res.status(404).json({ message: "No employment records found" });
        }

        res.status(200).json({
            success: true,
            message: "Employment records retrieved successfully",
            data: employmentRecords
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving employment records", error: error.message });
    }
};
