import mongoose from "mongoose";

const externalApiLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    provider: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    endpoint: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["SUCCESS", "TIMEOUT", "FAILED"],
        required: true,
    },
    httpStatus: {
        type: Number,
        required: false,
    },
    errorMessage: {
        type: String,
        required: false,
    },
    durationMs: {
        type: Number,
        required: true,
    },
    responseBody: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

const ExternalApiLog = mongoose.model("ExternalApiLog", externalApiLogSchema);
export default ExternalApiLog;
