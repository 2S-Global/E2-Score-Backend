//import Razorpay from "razorpay";
import KycOrder from "../../../models/KycorderModel.js";

import axios from "axios";

import CandidateKYC from "../../../models/CandidateKYCModel.js";
import Razorpay from "razorpay";

import {
  verifyPanWithZoop,
  verifyEpicWithZoop,
  verifyPassportWithZoop,
  verifyDLWithZoop,
  verifyAadhaarWithZoop,
} from "./verifydoc.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

import crypto from "crypto";

export const verifySignature = ({ orderId, paymentId, signature }) => {
  try {
    console.log("🔍 Verifying Razorpay Signature...");
    console.log("Order ID:", orderId);
    console.log("Payment ID:", paymentId);
    console.log("Signature (from Razorpay):", signature);

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${orderId}|${paymentId}`;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    console.log("Expected Signature:", expectedSignature);

    if (expectedSignature === signature) {
      console.log("✅ Signature verification successful!");
      return true;
    } else {
      console.error("❌ Signature mismatch!");
      return false;
    }
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
};

// check if order exists and not already paid
export const isOrderValid = async (orderId) => {
  const order = await KycOrder.findOne({ razorpay_order_id: orderId });

  if (!order) return false;
  if (order.is_paid) return false; // already used

  return true;
};

// update order as paid
export const markOrderPaid = async (orderId, paymentId) => {
  return await KycOrder.findOneAndUpdate(
    { razorpay_order_id: orderId },
    { isPaid: true, razorpay_payment_id: paymentId, status: "paid" },
    { new: true }
  );
};

export const RunVerificationProcess = async (orderId, userId) => {
  const Zoop_URL = process.env.ZOOP_BASE_URL;
  const zoopApiKey = process.env.ZOOP_APP_KEY;
  const zoopAppId = process.env.ZOOP_APP_ID;

  const order = await KycOrder.findOne({ razorpay_order_id: orderId, userId });
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  const kyc = await CandidateKYC.findOne({ userId });
  if (!kyc) {
    return { success: false, message: "KYC not found" };
  }

  switch (order.documentType) {
    case "pan":
      return await verifyPanWithZoop(kyc, Zoop_URL, zoopAppId, zoopApiKey);

    case "epic":
      return await verifyEpicWithZoop(kyc, Zoop_URL, zoopAppId, zoopApiKey);

    case "passport":
      return await verifyPassportWithZoop(kyc, Zoop_URL, zoopAppId, zoopApiKey);

    case "dl":
      return await verifyDLWithZoop(kyc, Zoop_URL, zoopAppId, zoopApiKey);

    case "aadhar":
      return await verifyAadhaarWithZoop(kyc, Zoop_URL, zoopAppId, zoopApiKey);

    default:
      return { success: false, message: "Unknown document type" };
  }
};
