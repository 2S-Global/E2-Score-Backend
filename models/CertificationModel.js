import mongoose from "mongoose";

const CertificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    certificationId: {
      type: String,
    },
    url: {
      type: String,
    },
    validityFromyear: {
      type: Number,
      default: null,
    },
    validityFrommonth: {
      type: Number,
      default: null,
    },
    validityToyear: {
      type: Number,
      default: null,
    },
    validityTomonth: {
      type: Number,
      default: null,
    },
    doesNotExpire: {
      type: Boolean,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserCertification = mongoose.model(
  "UserCertification",
  CertificationSchema
);

export default UserCertification;
