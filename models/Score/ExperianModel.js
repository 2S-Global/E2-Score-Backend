import mongoose from "mongoose";

const experianModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    Score: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const ExperianModel = mongoose.model("ExperianModel", experianModel);

export default ExperianModel;
