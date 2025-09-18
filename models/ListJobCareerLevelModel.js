import mongoose from "mongoose";

const CareerLevelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        label: {
            type: String,
        },
        isDel: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            required: true
        },
        isFlag: {
            type: Boolean,
            required: false
        }
    }
);

const list_job_career_level = mongoose.model("list_job_career_level", CareerLevelSchema);

export default list_job_career_level;