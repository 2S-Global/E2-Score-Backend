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
    is_del: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

MentalTestFeedBackSchema.index(
    { header: 1, question: 1 },
    { unique: true, partialFilterExpression: { is_del: false } }
);

const MentalTestFeedBackModel = mongoose.model("MentalTestFeedBack", MentalTestFeedBackSchema);

export default MentalTestFeedBackModel