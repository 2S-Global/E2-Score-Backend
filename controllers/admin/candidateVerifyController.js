import UserVerification from "../../models/userVerificationModel.js";
import mongoose from "mongoose";
export const getAllVerifiedCandidateAdmin = async (req, res) => {
  try {
    const paidUsers = await UserVerification.find({
      is_del: false,
      all_verified: 1,
    })
      .populate("employer_id", "name") // only get employer name
      .sort({ createdAt: -1 });

    if (!paidUsers.length) {
      return res.status(200).json({
        message: "No verified candidates found",
        data: [],
      });
    }

    const processedUsers = paidUsers.map((user) => {
      const userObj = user.toObject();
      const verificationsDone = [];

      // Check which verification responses exist and add to the array
      if (userObj.pan_response) verificationsDone.push("PAN");
      if (userObj.aadhaar_response) verificationsDone.push("Aadhaar");
      if (userObj.dl_response) verificationsDone.push("DL");
      if (userObj.passport_response) verificationsDone.push("Passport");
      if (userObj.epic_response) verificationsDone.push("Voter ID");
      if (userObj.uan_response) verificationsDone.push("UAN");
      if (userObj.epfo_response) verificationsDone.push("EPFO");

      return {
        employer_name: userObj.employer_id?.name || "N/A",
        date: new Date(userObj.createdAt).toLocaleDateString(),
        verifications_done: verificationsDone.join(", "),
        status: "verified", // since we're only fetching all_verified = 1
        candidate_name: userObj.candidate_name,
        candidate_email: userObj.candidate_email,
        candidate_mobile: userObj.candidate_mobile,
        candidate_dob: userObj.candidate_dob,
        candidate_address: userObj.candidate_address,
        candidate_gender: userObj.candidate_gender,
        id: userObj._id,
      };
    });

    return res.status(200).json({
      message: "Verified candidates fetched successfully",
      data: processedUsers,
    });
  } catch (error) {
    console.error("Error fetching verified candidates:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};

export const getPaidUserVerificationCartByEmployer = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(employer_id)) {
      return res.status(400).json({ message: "Invalid employer ID", data: [] });
    }

    const paidUsers = await UserVerification.find({ employer_id }).sort({
      createdAt: -1,
    });

    if (!paidUsers.length) {
      return res.status(200).json({
        message: "No paid users found for this employer",
        data: [],
      });
    }

    // Add status field based on all_verified
    const processedUsers = paidUsers.map((user) => ({
      ...user.toObject(), // convert Mongoose document to plain object
      status: user.all_verified === 1 ? "verified" : "processing",
    }));

    return res.status(200).json({
      message: "Paid users fetched successfully",
      data: processedUsers,
    });
  } catch (error) {
    console.error("Error fetching paid users:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};