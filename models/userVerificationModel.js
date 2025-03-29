import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema(
    {
        employer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        candidate_name: {
            type: String,
            required: true,
        },
        candidate_email: {
            type: String,
            required: true,
        },
        candidate_mobile: {
            type: String,
        },
        candidate_dob: {
            type: String,
            required: true,
        },
        candidate_address: {
            type: String,
        },
        candidate_gender: {
            type: String, // Fixed typo
        },
        pan_response: { 
            type: Object
        },
        pan_image: {
            type: String, // Ensure marks is stored properly
        },
        aadhaar_response: { 
            type: Object
        },
        aadhar_image: {
            type: String, // Ensure marks is stored properly
        },
        dl_response: { 
            type: Object
        },
        dl_image: {
            type: String, // Ensure marks is stored properly
        },
        passport_response: { 
            type: Object
        },
        passport_image: {
            type: String, // Ensure marks is stored properly
        },
        epic_response: { 
            type: Object
        },
        epic_image: {
            type: String, // Ensure marks is stored properly
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        
        is_del: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const UserVerification = mongoose.model("UserVerificationOrder", userVerificationSchema);

export default UserVerification;
