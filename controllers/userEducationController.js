import UserEducation from "../models/userEducationModel.js";

// Add a new user education record
export const addUserEducation = async (req, res) => {
    try {
        const user_id = req.userId;
        const { level, state, board, year_of_passing, medium_of_education, transcript_data, certificate_data, marks } = req.body;

        // Validate required fields
        if (!user_id || !level || !state || !year_of_passing) {
            return res.status(400).json({ message: "Employee ID, Level, State, and Year of Passing are required" });
        }

        // Create a new education record
        const newEducation = new UserEducation({
            user_id,
            level,
            state,
            board,
            year_of_passing,
            medium_of_education,
            transcript_data,
            certificate_data,
            marks,
        });

        await newEducation.save();

        res.status(201).json({ message: "Education record added successfully", data: newEducation });
    } catch (error) {
        res.status(500).json({ message: "Error adding education record", error: error.message });
    }
};

// Get list of user education records
export const listUserEducation = async (req, res) => {
    try {
        const user_id = req.userId;

        let query = {};
        if (user_id) {
            query.user_id = user_id;
        }

        const educationRecords = await UserEducation.find(query).sort({ createdAt: -1 });

        res.status(200).json({ message: "Education records retrieved successfully", data: educationRecords });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving education records", error: error.message });
    }
};


export const deleteUserEducation = async (req, res) => {
    try {
        const { id } = req.body; // Get the record ID from params

        // Soft delete by setting `is_del: true`
        const deletedRecord = await UserEducation.findByIdAndUpdate(id, { is_del: true }, { new: true });

        if (!deletedRecord) {
            return res.status(404).json({ message: "Education record not found" });
        }

        res.status(200).json({ message: "Education record deleted successfully", data: deletedRecord });
    } catch (error) {
        res.status(500).json({ message: "Error deleting education record", error: error.message });
    }
};


export const updateUserEducation = async (req, res) => {
    try {
        const { id } = req.params; // Get the record ID from params
        const updateData = req.body; // Get updated data from request body

        // Find and update the record
        const updatedRecord = await UserEducation.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedRecord) {
            return res.status(404).json({ message: "Education record not found" });
        }

        res.status(200).json({ message: "Education record updated successfully", data: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: "Error updating education record", error: error.message });
    }
};
