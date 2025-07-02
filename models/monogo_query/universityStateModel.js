import mongoose from "mongoose";

const universityStateSchema = new mongoose.Schema(
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
        },
    }
);

const list_university_state = mongoose.model("list_university_state", universityStateSchema);

export default list_university_state;