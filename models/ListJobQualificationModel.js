import mongoose from "mongoose";

const JobQualificationSchema = new mongoose.Schema(
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

const list_job_qualification = mongoose.model("list_job_qualification", JobQualificationSchema);

export default list_job_qualification;