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
        viva: {
            type: Boolean,
            required: true,
        },
        viva_and_written: {
            type: Boolean,
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
