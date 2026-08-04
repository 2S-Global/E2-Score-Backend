import mongoose from "mongoose";

const MentalTestQuiz = mongoose.Schema({
    question: {
        type: String
    },
    options: {
        type: Array
    },
    correctOption: {
        type: String
    },
    is_Deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })
const MentalTestQuizModel = mongoose.model("MentalTestQuiz", MentalTestQuiz)

export default MentalTestQuizModel
