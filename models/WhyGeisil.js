import mongoose from "mongoose";
import { titleCasePlugin } from "../plugins/titleCasePlugin.js";
// import { slugPlugin } from "../plugins/slugPlugin.js";


export const WhyGeisil = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    backgroundColor: { type: String },

    isdel: {
        type: Boolean,
        default: false
    }
})



WhyGeisil.plugin(titleCasePlugin, ['title'])
// WhyGeisil.plugin(slugPlugin, ['title'])




// WhyGeisil.pre('save', function () {

//     if (!this.isModified('title')) return

//     this.title = this.title
//         .trim()
//         .toLowerCase()
//         .split(/\s+/)
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");



// })

const WhyGeisilModel = mongoose.model('WhyGeisil', WhyGeisil);

export default WhyGeisilModel;