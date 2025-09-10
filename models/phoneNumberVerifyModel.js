import mongoose from "mongoose";

const phoneNumberVerifySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String,
        },
        otpExpiresAt: {
            type: Date,
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

const PhoneNumberVerify = mongoose.model("phone_number_verify", phoneNumberVerifySchema);

export default PhoneNumberVerify;
