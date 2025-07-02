import mongoose from "mongoose";

const universityUniversitySchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        name: {
            type: String,
        },
        address: {
            type: String,
        },
        establishment_year: {
            type: String,
        },
        cat_id: {
            type: String,
        },
        state_id: {
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

const list_university_univercities = mongoose.model("list_university_univercities", universityUniversitySchema, "list_university_univercities");

export default list_university_univercities