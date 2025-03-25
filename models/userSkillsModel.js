import mongoose from "mongoose";

const userSkillsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skill_name: {
        type: String,
        required: true,
    },
    software_version: {
        type: String,
        required: true,
    },
    last_used_year: {
        type: String,
    },
    experience_year: {
        type: String,
        /*         required: true,
                unique: true, */
    },
    experience_month: {
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

const UserSkills = mongoose.model("UserSkills", userSkillsSchema);

export default UserSkills;