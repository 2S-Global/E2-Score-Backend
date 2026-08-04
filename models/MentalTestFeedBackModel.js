import mongoose from "mongoose";


const MentalTestFeedBackSchema = new mongoose.Schema({
    header: {
        type: String,
        required: true,
        trim: true,
        min: 1,

    },
    question: {
        type: String,
        required: true,
        trim: true,
        min: 1,

    },




}, { timestamps: true })


const MentalTestFeedBackModel = mongoose.model("MentalTestFeedBack", MentalTestFeedBackSchema);

export default MentalTestFeedBackModel