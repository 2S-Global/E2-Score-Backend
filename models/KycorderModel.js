import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    amount: Number,
    status: { type: String, default: "pending" },
    documentType: { type: String },
    is_paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const KycOrder = mongoose.model("KycOrder", Schema);
export default KycOrder;
