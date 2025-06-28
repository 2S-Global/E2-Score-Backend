import mongoose from "mongoose";

const jobRolesSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        industry_id: {
            type: Number
        },
        department_id: {
            type: Number
        },
        job_role: {
            type: String,
        },
        is_del: {
            type: Number,
            required: true
        },
        is_active: {
            type: Number,
            required: true
        },
    }
);

const list_job_role= mongoose.model("list_job_role", jobRolesSchema);

export default list_job_role;