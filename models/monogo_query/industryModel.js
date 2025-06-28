import mongoose from "mongoose";

const industrySchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        job_industry: {
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

const list_industries = mongoose.model("list_industries", industrySchema, "list_industries");

export default list_industries;
