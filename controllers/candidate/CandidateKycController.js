import User from "../../models/userModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";

//helpers
import {
  resetVerificationFlags,
  updateKYCFields,
  validateKYCData,
} from "./Helpers/kycHelpers.js";

// Add or Update KYC Information
export const addOrUpdateKYC = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const userExists = await User.findById(userId);
  if (!userExists) return res.status(404).json({ message: "User not found" });

  const newData = req.body;

  // ✅ Validate KYC data
  const validationErrors = validateKYCData(newData);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validationErrors,
      success: false,
    });
  }

  let existingKYC = await CandidateKYC.findOne({ userId });

  if (existingKYC) {
    // Reset verification flags if any critical field changed
    resetVerificationFlags(existingKYC, newData);

    // Update KYC fields
    updateKYCFields(existingKYC, newData);

    await existingKYC.save();
    return res.status(200).json({
      message: "KYC updated successfully",
      /*  kyc: existingKYC, */
      success: true,
    });
  }

  // Create new KYC
  const newKYC = new CandidateKYC({ userId, ...newData });
  await newKYC.save();
  return res
    .status(201)
    .json({ message: "KYC created successfully", kyc: newKYC, success: true });
};
