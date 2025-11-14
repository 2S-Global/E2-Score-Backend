import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    required_services: {
      type: String,
      //  default: 'company',
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
    },
    address: {
      type: String,
    },
    gst_no: {
      type: String,
    },
    package_id: {
      type: String,
    },
    allowed_verifications: {
      type: String,
    },
    discount_percent: {
      type: String,
    },
    transaction_fee: {
      type: String,
    },
    transaction_gst: {
      type: String,
    },
    gender: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    wallet_amount: {
      type: Number,
      default: 0,
    },
    self_registered: {
      /* 0 for admin ,1 for By own  */
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      /* 0 for admin ,1 for candidate ,2 for company, 3 institute  */
      type: Number,
      required: true,
      default: 1,
    },
    check_role: {
      type: Boolean,
      default: false,
    },
    switchedRole: {
      type: Number,
      default: null,
    },
    cin_number: {
      type: String,
      // required: true
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companylist",
      // required: true
    },
    isVerified: { type: Boolean, default: false },
    numberVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
