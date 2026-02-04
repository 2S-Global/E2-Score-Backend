import mongoose from "mongoose";

const jobPostingTempSchema = new mongoose.Schema(
    {
        originalJobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPosting",
            required: true,
            unique: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobData: {
            type: Object,
            required: true,
        },
        status: {
            type: String,
            default: "preview",
        },
    },
    { timestamps: true }
);

const JobPostingTemp = mongoose.model("JobPostingTemp", jobPostingTempSchema);
export default JobPostingTemp;