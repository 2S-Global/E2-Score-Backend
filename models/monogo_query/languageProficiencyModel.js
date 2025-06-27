import mongoose from "mongoose";

const languageProficiencySchema = new mongoose.Schema(
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

const list_language_proficiency = mongoose.model("list_language_proficiency", languageProficiencySchema, "list_language_proficiency");

export default list_language_proficiency;