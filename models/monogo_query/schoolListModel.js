import mongoose from "mongoose";

const schoolListSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        school_name: {
            type: String,
        },
        board_id: {
            type: Number
        },
        is_del: {
            type: Number,
            required: true
        },
        is_active: {
            type: Number,
            required: true
        }
    }
);

const list_school_list = mongoose.model("list_school_list", schoolListSchema, "list_school_list");

export default list_school_list