import mongoose from "mongoose";

const MentalTestAttemptSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MentalTestQuiz",
                required: true
            },
            selectedOption: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ],
    totalQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    is_Deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const MentalTestAttemptModel = mongoose.model('MentalTestAttempt', MentalTestAttemptSchema)


export default MentalTestAttemptModel