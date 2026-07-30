import mongoose from "mongoose";

export const VerificationServices = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim:true,
        unique:true

    },
    icon: {
        type: String,
        required: true
    },
    iconColor: {
        type: String,
        default: "#000000"
    },
    backgroundColor: {
        type: String,

    }
    ,
    description: {
        type: String,
        required: true,
    }
    ,
    isdel: {
        type: Boolean,
        default: false
    },


}, {
    timestamps: true
})

VerificationServices.pre('save', function () {

    if (!this.isModified('title')) return

    this.title = this.title
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");



})



const VerificationServicesModel = mongoose.model('VerificationServices', VerificationServices);

export default VerificationServicesModel;