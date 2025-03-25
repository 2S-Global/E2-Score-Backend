import mongoose from "mongoose";

const userProjectSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project_title: {
        type: String,
        required: true,
    },
    employee_role: {
        type: String,
        required: true,
    },
    client_name: {
        type: String,
    },
    projrct_status: {
        type: String,
        required: true,
        /*         unique: true, */
    },
    work_start_year: {
        type: String,
    },
    work_start_month: {
        type: String,
    },
    work_till_year: {
        type: String,
    },
    work_till_month: {
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

const UserProject = mongoose.model("UserProject", userProjectSchema);

export default UserProject;