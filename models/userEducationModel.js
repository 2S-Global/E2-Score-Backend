import mongoose from "mongoose";

const userEducationSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        board: {
            type: String,
        },
        year_of_passing: {
            type: String,
            required: true,
        },
        medium_of_education: {
            type: String,
        },
        transcript_data: {
            type: String, // Fixed typo
        },
        certificate_data: {
            type: String, // Fixed typo
        },
        marks: {
            type: String, // Ensure marks is stored properly
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        is_del: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const UserEducation = mongoose.model("UserEducation", userEducationSchema);

export default UserEducation;
