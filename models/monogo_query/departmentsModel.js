import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        industry_id: {
            type: Number
        },
        job_department: {
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

const list_department = mongoose.model("list_department", departmentSchema);

export default list_department;