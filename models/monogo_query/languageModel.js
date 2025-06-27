import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        name: {
            type: String,
        },
        "iso_639-1": {
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

const list_language = mongoose.model("list_language", languageSchema);

export default list_language;