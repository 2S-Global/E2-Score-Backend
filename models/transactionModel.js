import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
    },
    paymentids: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    paymenttime: {
        type: Date,
        default: Date.now,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
