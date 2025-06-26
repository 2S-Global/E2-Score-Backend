import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        category_name: {
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

const list_category = mongoose.model("list_category", categorySchema, "list_category");

export default list_category;