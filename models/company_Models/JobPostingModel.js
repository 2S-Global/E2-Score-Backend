import mongoose from "mongoose";

const jobPostingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobTitle: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        getApplicationUpdateEmail: {
            type: String,
            required: true,
        },
        // specialization: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "list_job_specialization",
        // }],
        specialization: {
            type: [String],
            required: true
        },
        // jobSkills: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "list_key_skill",
        // }],
        jobSkills: {
            type: [String],
            required: true
        },
        jobType: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_job_type",
        }],
        positionAvailable: {
            type: String,
            required: true,
        },
        showBy: {
            type: String,
            // enum: ["fixed", "range", "maximum", "minimum"],
            // default: "fixed"
        },
        expectedHours: {
            type: String
        },
        fromHours: {
            type: String
        },
        toHours: {
            type: String
        },
        contractLength: {
            type: String
        },
        contractPeriod: {
            type: String,
            // enum: ["month", "week", "day"],
        },
        jobExpiryDate: {
            type: Date
        },
        salary: {
            structure: {
                type: String,
                enum: ["range", "starting amount", "maximum amount", "exact amount"],
                default: "range"
            },
            currency: {
                type: String,
                enum: ["₹", "$", "€", "£"],
                default: "₹"
            },
            min: {
                type: Number
            },
            max: {
                type: Number
            },
            amount: {
                type: Number
            },
            rate: {
                type: String,
                enum: ["per hour", "per day", "per week", "per month", "per year"],
                default: "per year"
            },
        },
        benefits: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_job_benefit",
        }],
        careerLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_job_career_level"
        },
        experienceLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_job_experience_level"
        },
        gender: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_gender",
        }],
        industry: {
            type: String
        },
        qualification: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_job_qualification",
        }],
        jobLocationType: {
            type: String,
            enum: ["remote", "on-site", "hybrid"]
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "list_tbl_countrie"
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "list_tbl_cities"
            ref: "list_india_cities"
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyBranch"
        },
        address: {
            type: String
        },
        advertiseCity: {
            type: String,
            // enum: ["Yes", "No"],
        },
        advertiseCityName: {
            type: String
        },
        status: {
            type: String,
            enum: ["draft", "completed"],
            default: "draft"
        },
        resumeRequired: {
            type: Boolean,
            default: false,
        },
        is_del: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const JobPosting = mongoose.model("JobPostingList", jobPostingSchema);
export default JobPosting;