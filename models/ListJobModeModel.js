import mongoose from "mongoose";

const JobModeSchema = new mongoose.Schema(
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

const list_job_mode = mongoose.model("list_job_mode", JobModeSchema);

export default list_job_mode;