import mongoose from "mongoose";

const universityCourseSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        type: {
            type: String,
        },
        name: {
            type: String,
        },
        flag: {
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
    }
);

const list_university_course = mongoose.model("list_university_course", universityCourseSchema);

export default list_university_course