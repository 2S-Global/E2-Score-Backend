import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        student_name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InstitueStudent",
            required: true,
        },

        role: {
            type: String,
            trim: true,
        },

        evaluation_type: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            required: true,
            trim: true,
        },

        score: {
            type: Number,
            default: 0,
        },

        date: {
            type: Date,
            default: Date.now,
        },

        evaluator_name: {
            type: String,
            required: true,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },

        location: {
            type: String,
            trim: true,
        },

        isDel: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const StudentEvaluation = mongoose.model(
    "StudentEvaluation",
    EvaluationSchema
);

export default StudentEvaluation;