import razorpay from "../config/razorpay.js";
import crypto from "crypto";

//Creates a Razorpay order.

export const createRazorpayOrder = async (amount, currency = "INR") => {
  const amountInPaise = Math.round(parseFloat(amount) * 100);
  const options = {
    amount: amountInPaise, // convert ₹ to paise
    currency: currency,
    receipt: `receipt_${Date.now()}`,
  };

  return await razorpay.orders.create(options);
};

//verification
export const verifyRazorpayPayment = (paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      success: false,
      message:
        "Missing payment verification parameters (order ID, payment ID, or signature)",
    };
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return {
      success: false,
      message: "Payment verification failed: Signature mismatch",
    };
  }

  return {
    success: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  };
};
