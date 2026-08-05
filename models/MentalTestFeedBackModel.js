import mongoose from "mongoose";
import "./MentalTestHeaderModel.js";

const MentalTestFeedBackSchema = new mongoose.Schema({
    header: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MentalTestHeader",
        required: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
        min: 1
    },
}, { timestamps: true })

const MentalTestFeedBackModel = mongoose.model("MentalTestFeedBack", MentalTestFeedBackSchema);

export default MentalTestFeedBackModel