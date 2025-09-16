import User from "../../../models/userModel.js";
import ListVerificationList from "../../../models/monogo_query/verificationListModel.js";
export const AddtoCart = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 🔹 Fetch user from DB first
    const user = await User.findById(user_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { number, field_id } = req.body;

    if (!number || !field_id) {
      return res.status(400).json({
        message: "Both number and field_id are required",
        success: false,
      });
    }
    const verificationItem = await ListVerificationList.findById(field_id);
    if (
      !verificationItem ||
      verificationItem.isDel ||
      !verificationItem.isActive
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Verification item not found" });
    }
    //validate number with regex
    const regex = new RegExp(verificationItem.regex);
    if (!regex.test(number)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid number format" });
    }

    // Your logic to add item to cart goes here
    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};
