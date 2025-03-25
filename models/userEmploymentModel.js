import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    is_current_employment: {
        type: String,
        required: true,
    },
    employment_type: {
        type: String,
        required: true,
    },
    total_experience_year: {
        type: String,
    },
    total_experience_month: {
        type: String,
    },
    company_name: {
        type: String,
        required: true,
        /*         unique: true, */
    },
    job_title: {
        type: String,
    },
    joining_year: {
        type: String,
    },
    joining_month: {
        type: String,
    },
    joining_details: {
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
}, {
    timestamps: true,
});

const UserEmployment = mongoose.model("UserEmployment", userSchema);

export default UserEmployment;