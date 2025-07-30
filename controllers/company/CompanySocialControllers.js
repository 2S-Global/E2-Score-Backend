import CompanySocial from "../../models/company_Models/CompanySocial.js";
import User from "../../models/userModel.js";

export const addOrUpdateSocial = async (req, res) => {
  try {
    const {
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
      telegram,
      discord,
      github,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const socialData = {
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
      telegram,
      discord,
      github,
    };

    const updatedSocial = await CompanySocial.findOneAndUpdate(
      { userId },
      { $set: socialData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const message = updatedSocial.wasNew
      ? "Social media links added successfully"
      : "Social media links updated successfully";

    return res.status(updatedSocial.wasNew ? 201 : 200).json({
      success: true,
      message,
      data: updatedSocial,
    });
  } catch (error) {
    console.error("Error adding or updating social:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding or updating social media links",
      error: error.message,
    });
  }
};

export const getSocial = async (req, res) => {
  try {
    const social = await CompanySocial.findOne({ userId: req.userId });

    if (!social) {
      return res
        .status(404)
        .json({ success: false, message: "Social not found" });
    }

    return res.status(200).json({ success: true, data: social });
  } catch (error) {
    console.error("Error getting social:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting social media links",
      error: error.message,
    });
  }
};
