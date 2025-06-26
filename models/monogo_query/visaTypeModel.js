import mongoose from "mongoose";

const visaTypeSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        visa_name: {
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

const list_visa_type = mongoose.model("list_visa_type", visaTypeSchema, "list_visa_type");

export default list_visa_type;