import mongoose from "mongoose";

const MentalTestQuiz = mongoose.Schema({
    question: {
        type: String,
        trim: true
    },
    options: [
        {
            text: {
                type: String,
                required: true,
                trim: true
            },

            trait: {
                type: String,
                enum: ["D", "I", "S", "C"],
                required: true
            }
        }
    ],
    is_Deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })
const MentalTestQuizModel = mongoose.model("MentalTestQuiz", MentalTestQuiz)

export default MentalTestQuizModel
