import mongoose from "mongoose";

const gradingSystemSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        name: {
            type: String,
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

const list_grading_system = mongoose.model("list_grading_system", gradingSystemSchema, "list_grading_system");

export default list_grading_system