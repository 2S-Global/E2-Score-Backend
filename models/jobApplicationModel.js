import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPosting",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        appliedAt: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ["applied", "shortlisted", "rejected"],
            default: "applied",
        },

        isDel: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;