import mongoose from "mongoose";

const studentCourseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        course_mongo_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'list_university_course',
            required: false
        },
        course_sql_id: {
            type: Number
        },
        type: {
            type: String,
        },
        name: {
            type: String,
        },
        course_durartion: {
            type: String,
        },
        courseStructure: {
            type: String,
            enum: ["year", "semester"],
            required: true
        },
        marksType: {
            type: String,
            enum: ["dgpa", "cgpa", "percentage"],
            required: true
        },
        total_number_of_semesters: {
            type: String,
        },
        is_del: {
            type: Number,
            required: true
        },
    }
);

const student_course_details = mongoose.model("student_course_details", studentCourseSchema);

export default student_course_details