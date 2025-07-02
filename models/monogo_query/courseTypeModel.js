import mongoose from "mongoose";

const courseTypeSchema = new mongoose.Schema(
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

const list_course_type = mongoose.model("list_course_type", courseTypeSchema, "list_course_type");

export default list_course_type