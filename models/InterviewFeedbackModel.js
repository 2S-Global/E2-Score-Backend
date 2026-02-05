import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema(
    {
        // Link to Job Application
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobApplication",
            required: true,
        },

        // Interviewer (HR / Tech Panel)
        interviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Scores
        communicationSkillScore: {
            type: Number,
            min: 0,
            max: 10,
            // required: true,
        },

        technicalSkillScore: {
            type: Number,
            min: 0,
            max: 10,
            // required: true,
        },

        aptitudeScore: {
            type: Number,
            min: 0,
            max: 10,
            // required: true,
        },

        overallScore: {
            type: Number,
            min: 0,
            max: 10,
            // required: true,
        },

        // Interviewer remarks
        lastDrawnSalary: {
        type: String,
        trim: true,
        },

        // Interviewer remarks
        expectedSalary: {
        type: String,
        trim: true,
        },

        // Interviewer remarks
        message: {
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

const InterviewFeedback = mongoose.model(
    "InterviewFeedback",
    interviewFeedbackSchema
);

export default InterviewFeedback;
