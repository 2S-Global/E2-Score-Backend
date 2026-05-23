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
        },
        remarks: {
            type: String, // e.g. "10:30 AM"
        },
        role: {
            type: String,
        },
        date: {
            type: Date,
        },
        time: {
            type: String,
        },
        numberOfCandidates: {
            type: Number,
        },
        numberOfOpenings: {
            type: Number,
        },
        numberOfHired: {
            type: Number,
        },
        ratings: {
            type: Number,
        },
        year: {
            type: Number,
            default: () => new Date().getFullYear(),
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
