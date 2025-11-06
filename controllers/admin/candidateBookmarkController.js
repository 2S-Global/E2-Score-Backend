import User from "../../models/userModel.js";
import CandidateBookmark from "../../models/candidateBookmarkModel.js";
export const addCandidateBookmark = async (req, res) => {
    try {
        const { bookmark, _id } = req.body;
        const user_id = req.userId;

        // Validate input fields
        if (typeof bookmark !== "boolean" || !_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid request. 'bookmark' (boolean) and '_id' (candidateId) are required.",
            });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if this candidate is already bookmarked by this employer
        const existingBookmark = await CandidateBookmark.findOne({
            userId: _id,
            isDel: false,
        });

        let updatedBookmark;

        if (existingBookmark) {
            // If record exists, update isArchived based on `bookmark` value
            existingBookmark.isArchived = bookmark;
            updatedBookmark = await existingBookmark.save();
        } else {
            // Otherwise, create new bookmark entry
            updatedBookmark = await CandidateBookmark.create({
                userId: _id,
                isArchived: bookmark,
            });
        }

        res.status(200).json({
            success: true,
            message: `Candidate has been ${bookmark ? "bookmarked" : "unbookmarked"} successfully.`,
            data: updatedBookmark,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getCandidateBookmarkStatus = async (req, res) => {
    try {
        const { _id } = req.query;
        const user_id = req.userId;

        // Validate required fields
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Missing _id for candidate in request query.",
            });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Find bookmark entry for this user and candidate
        const bookmark = await CandidateBookmark.findOne({
            userId: _id,
            isDel: false,
        });

        const isBookmarked = bookmark ? bookmark.isArchived : false;

        return res.status(200).json({
            success: true,
            message: "Bookmark status fetched successfully.",
            data: { isBookmarked },
        });
    } catch (error) {
        console.error("Error in getCandidateBookmarkStatus:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};