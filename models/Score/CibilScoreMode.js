import mongoose from "mongoose";

const cibilmodel = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
    },
    Score: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const CibilModel = mongoose.model("Cibil", cibilmodel);
export default CibilModel;
