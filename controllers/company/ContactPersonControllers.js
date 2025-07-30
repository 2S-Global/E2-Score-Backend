import ContactpersonDetails from "../../models/company_Models/ContactpersonDetails.js";
import User from "../../models/userModel.js";

export const AddorUpdateContactPerson = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.userId;

    if (!name || !email || !phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number" });
    }

    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const contactperson = await ContactpersonDetails.findOneAndUpdate(
      { userId },
      { name, email, phone, address },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: contactperson,
      message: "Contact person details updated successfully",
    });
  } catch (error) {
    console.error("Error in AddorUpdateContactPerson:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message || error,
    });
  }
};

export const GetContactPerson = async (req, res) => {
  try {
    const contactperson = await ContactpersonDetails.findOne({
      userId: req.userId,
    });

    if (!contactperson) {
      return res.status(404).json({
        success: false,
        message: "Contact person details not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: contactperson.name,
        email: contactperson.email,
        phone: contactperson.phone,
        address: contactperson.address,
      },
    });
  } catch (error) {
    console.error("Error in GetContactPerson:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message || error,
    });
  }
};
