import mongoose from "mongoose";

const CompanyRequirementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        companyName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyByInstitute",
            required: true,
        },
        examinationType: {
            type: String, // e.g. "10:30 AM"
            required: true,
        },
        remarks: {
            type: String, // e.g. "10:30 AM"
        },
        role: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String, // e.g. "10:30 AM"
            required: true,
        },
        numberOfCandidates: {
            type: Number,
            required: true,
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

const CompanyRequirement = mongoose.model("CompanyRequirement", CompanyRequirementSchema);

export default CompanyRequirement;
