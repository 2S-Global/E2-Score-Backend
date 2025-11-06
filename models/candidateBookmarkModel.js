import mongoose from "mongoose";

const candidateBookmarkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        isDel: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const CandidateBookmark = mongoose.model("CandidateBookmark", candidateBookmarkSchema);

export default CandidateBookmark;