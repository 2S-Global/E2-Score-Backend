import mongoose from "mongoose";

const recentSearchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        query: {
            type: String,
            required: true,
            trim: true,
        },

        normalizedQuery: {
            type: String,
            required: true,
        },

        lastSearchedAt: {
            type: Date,
            default: Date.now,
        },

        searchCount: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

recentSearchSchema.index(
    { userId: 1, normalizedQuery: 1 },
    { unique: true }
);

recentSearchSchema.index({
    userId: 1,
    lastSearchedAt: -1,
});

const RecentSearch = mongoose.model("RecentSearch", recentSearchSchema);

export default RecentSearch;
