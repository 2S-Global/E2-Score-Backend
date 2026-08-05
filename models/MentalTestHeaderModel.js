import mongoose from "mongoose";

const MentalTestHeaderSchema = new mongoose.Schema({
    header: {
        type: String,
        required: true,
        trim: true,
        min: 1,
    },
}, { timestamps: true });










const MentalTestHeaderModel = mongoose.model("MentalTestHeader", MentalTestHeaderSchema);

export default MentalTestHeaderModel;
