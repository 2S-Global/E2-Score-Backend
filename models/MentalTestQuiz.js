import mongoose from "mongoose";

const MentalTestQuiz = mongoose.Schema({
    question: {
        type: String,
        trim: true
    },
    options: {
        type: Array,
        trim: true
    },
    correctOption: {
        type: String,
        trim: true
    },
    is_Deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })
const MentalTestQuizModel = mongoose.model("MentalTestQuiz", MentalTestQuiz)

export default MentalTestQuizModel
