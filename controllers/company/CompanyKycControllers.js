import User from "../../models/userModel.js";
import CompanyKYC from "../../models/CompanyKYCModel.js";

import Fees from "../../models/feesModel.js";
import KycOrder from "../../models/KycorderModel.js";
import Razorpay from "razorpay";
import axios from "axios";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

import {
  validateKYCData,
  updateKYCFields,
  resetVerificationFlags,
} from "./helpers/kycHelpers.js";
import {
  verifySignature,
  isOrderValid,
  RunVerificationProcesscompany,
  markOrderPaid,
} from "../candidate/Helpers/paymentHelper.js";

export const addOrUpdateKYC = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const userExists = await User.findById(userId).lean();
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

  let existingKYC = await CompanyKYC.findOne({ userId });

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
  const newKYC = new CompanyKYC({ userId, ...newData });
  await newKYC.save();
  return res
    .status(201)
    .json({ message: "KYC created successfully", kyc: newKYC, success: true });
};

export const getKYC = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "User ID is required" });
  const kyc = await CompanyKYC.findOne({ userId }).lean();
  if (!kyc) return res.status(404).json({ message: "KYC not found" });
  return res.status(200).json({ kyc, success: true });
};

//get specific fees
export const getSpecificFees = async (req, res) => {
  const { documentType } = req.params;

  try {
    const fees = await Fees.findOne({});
    if (!fees) {
      return res.status(404).json({
        success: false,
        message: "No fees configuration found",
      });
    }

    // Mapping document type to fees
    const feesMap = {
      pan: fees.pan_fees,
      epic: fees.epic_fees,
      passport: fees.passport_fees,
      dl: fees.dl_fees,
      aadhar: fees.aadhar_fees,
    };

    // Pick fees dynamically or fallback to default
    const actualFees = Number(feesMap[documentType] ?? fees.fees ?? 0);

    return res.status(200).json({
      success: true,
      fees: actualFees,
    });
  } catch (error) {
    console.error("❌ GetFees error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//create order
export const CreateOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document is required",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const fees = await Fees.findOne({});
    if (!fees) {
      return res.status(404).json({
        success: false,
        message: "No fees configuration found",
      });
    }

    // Mapping document type to fees
    const feesMap = {
      pan: fees.pan_fees,
      epic: fees.epic_fees,
      passport: fees.passport_fees,
      dl: fees.dl_fees,
      aadhar: fees.aadhar_fees,
    };

    // Pick fees dynamically or fallback to default
    const actualFees = Number(feesMap[documentType] ?? fees.fees ?? 0);

    const amount = actualFees;

    // Basic validation
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing amount",
      });
    }

    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      payment_capture: 1,
    });

    // Save order in DB
    const newOrder = new KycOrder({
      razorpay_order_id: order.id,
      amount,
      userId,
      documentType,
    });

    await newOrder.save();

    // Success response
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ CreateOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

export const VerifyOrder = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const userId = req.userId;

    // Step 1: Verify signature
    const isValid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
    const orderofUser = await KycOrder.findOne({
      razorpay_order_id: razorpay_order_id,
      userId,
    });
    if (!orderofUser) {
      return { success: false, message: "Order not found" };
    }

    // Step 2: Validate order
    const validOrder = await isOrderValid(razorpay_order_id);
    if (!validOrder) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired order",
      });
    }

    //Step 3 : Run Verification Process
    const verificationResult = await RunVerificationProcesscompany(
      razorpay_order_id,
      userId
    );

    // Step 4: Mark order as paid
    const updatedOrder = await markOrderPaid(
      razorpay_order_id,
      razorpay_payment_id
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
      verificationResult,
    });
  } catch (error) {
    console.error("VerifyOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify order",
      error: error.message,
    });
  }
};
