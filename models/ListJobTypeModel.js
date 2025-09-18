import mongoose from "mongoose";

const JobTypeSchema = new mongoose.Schema(
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

const list_job_type = mongoose.model("list_job_type", JobTypeSchema);

export default list_job_type;