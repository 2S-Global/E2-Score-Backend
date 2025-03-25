import UserProject from "../models/userProjectsModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// Register a new user
export const addUserProject = async (req, res) => {
    try {
        const { 
            user_id, 
            project_title, 
            employee_role, 
            client_name, 
            projrct_status, 
            work_start_year, 
            work_start_month, 
            work_till_year, 
            work_till_month 
        } = req.body;

        // Validate required fields
        if (!user_id || !project_title || !employee_role || !projrct_status) {
            return res.status(400).json({ message: "User ID, Project Title, Employee Role, and Project Status are required" });
        }

        // Create a new project entry
        const newProject = new UserProject({
            user_id,
            project_title,
            employee_role,
            client_name,
            projrct_status,
            work_start_year,
            work_start_month,
            work_till_year,
            work_till_month
        });

        await newProject.save();

        res.status(201).json({
            success: true,
            message: "Project added successfully",
            data: newProject
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding project", error: error.message });
    }
};

export const listUserProject = async (req, res) => {
    try {
        const { user_id } = req.body;

        // Validate user_id
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch projects for the given user_id where is_del is false
        const projects = await UserProject.find({ user_id, is_del: false });

        if (!projects.length) {
            return res.status(404).json({ message: "No projects found for this user" });
        }

        res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            data: projects,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving projects", error: error.message });
    }
};


// Delete expense
/* export const deleteExpense = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from the authenticated user (via middleware)
        const expenseId = req.params.expenseId; // Get expenseId from URL params
        const expense = await Expense.findById(expenseId);
        
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        if (expense.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own expenses" });
        }
        await Expense.findByIdAndUpdate(expenseId, { is_del: true });
        res.status(200).json({ message: "Expense deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Error deleting expense" });
    }
}; */



export const deleteUserProject = async (req, res) => {
    try {
        const { project_id, user_id } = req.body;

        // Validate required fields
        if (!project_id || !user_id) {
            return res.status(400).json({ message: "Project ID and User ID are required" });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(project_id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        // Convert project_id to ObjectId
        const objectId = new mongoose.Types.ObjectId(project_id);

        // Find the project and update is_del to true
        const updatedProject = await UserProject.findOneAndUpdate(
            { _id: objectId, user_id, is_del: false }, // Ensure the project is active
            { is_del: true, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            data: updatedProject
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project", error: error.message });
    }
};





export const editUserProject = async (req, res) => {
    try {
        const { 
            project_id, 
            user_id, 
            project_title, 
            employee_role, 
            client_name, 
            projrct_status, 
            work_start_year, 
            work_start_month, 
            work_till_year, 
            work_till_month 
        } = req.body;

        // Validate required fields
        if (!project_id || !user_id) {
            return res.status(400).json({ message: "Project ID and User ID are required" });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(project_id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        // Convert project_id to ObjectId
        const objectId = new mongoose.Types.ObjectId(project_id);

        // Find and update the project
        const updatedProject = await UserProject.findOneAndUpdate(
            { _id: objectId, user_id, is_del: false }, // Ensure project is not deleted
            { 
                project_title, 
                employee_role, 
                client_name, 
                projrct_status, 
                work_start_year, 
                work_start_month, 
                work_till_year, 
                work_till_month,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: updatedProject
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating project", error: error.message });
    }
};
