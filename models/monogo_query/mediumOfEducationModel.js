import mongoose from "mongoose";

const educationMediumSchema = new mongoose.Schema(
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

const list_medium_of_education = mongoose.model("list_medium_of_education", educationMediumSchema, "list_medium_of_education");

export default list_medium_of_education