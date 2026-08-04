import mongoose from "mongoose";


const AttemptedMentalTestFeedbackSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MentalTestFeedBack"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    remarks: {
        type: Number,
        required: true,
        trim: true,
        min: 1,
        max: 5
    }

}, { timestamps: true })


const AttemptedMentalTestFeedbackModel = mongoose.model("AttemptedMentalTestFeedback", AttemptedMentalTestFeedbackSchema);

export default AttemptedMentalTestFeedbackModel