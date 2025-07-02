import mongoose from "mongoose";

const universityCollegeSchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        university_id: {
            type: Number
        },
        clg_code: {
            type: String,
        },
        name: {
            type: String,
        },
        establish_on: {
            type: String,
        },
        address: {
            type: String,
        },
        tel: {
            type: String,
        },
        fax: {
            type: String,
        },
        email: {
            type: String,
        },
        website: {
            type: String,
        },
        courses: {
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
        flag: {
            type: Number,
            required: true
        },
    }
);

const list_university_colleges = mongoose.model("list_university_colleges", universityCollegeSchema, "list_university_colleges");

export default list_university_colleges