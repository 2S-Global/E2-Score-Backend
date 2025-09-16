import User from "../../models/userModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";

//helpers
import {
  resetVerificationFlags,
  updateKYCFields,
  validateKYCData,
} from "./Helpers/kycHelpers.js";

// Add or Update KYC Information
/**
 * Add or Update KYC Information
 *
 * This function adds a new KYC record or updates an existing one.
 * It validates the incoming data and resets verification flags if any critical field changed.
 * If the KYC record already exists, it updates the existing record, otherwise it creates a new one.
 *
 * @param {Object} req.body - KYC data to be added or updated
 * @param {ObjectId} req.userId - User ID of the candidate
 * @returns {Object} Response object with success message and KYC data
 */
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

// Get KYC Information
/**
 * Get KYC Information
 *
 * This function retrieves the KYC information of a candidate.
 *
 * @param {ObjectId} req.userId - User ID of the candidate
 * @returns {Object} Response object with KYC data and success message
 * @throws {Error} 400 - User ID is required
 * @throws {Error} 404 - User not found or KYC not found
 */
export const getKYC = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const userExists = await User.findById(userId);
  if (!userExists) return res.status(404).json({ message: "User not found" });

  const kyc = await CandidateKYC.findOne({ userId });
  if (!kyc) return res.status(404).json({ message: "KYC not found" });

  return res.status(200).json({ kyc, success: true });
};
