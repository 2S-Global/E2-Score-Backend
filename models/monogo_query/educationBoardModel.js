import mongoose from "mongoose";

const educationBoardSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        board_name: {
            type: String,
        },
        state_region: {
            type: String,
        },
        state_region_id: {
            type: Number,
        },
        is_del: {
            type: Number,
            required: true
        },
        is_active: {
            type: Number,
            required: true
        },
        flag: {
            type: Number,
            required: true
        },
    }
);

const list_education_boards = mongoose.model("list_education_boards", educationBoardSchema, "list_education_boards");

export default list_education_boards