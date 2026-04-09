import mongoose from "mongoose";
const TestimonialSchema = new mongoose.Schema({
  subject: { type: String,required:true,trim:true },
  customer_name: { type: String ,required:true,trim:true},
  customer_designation: { type: String ,required:true,trim:true},
  customer_image: { type: String,default:null },
  description: { type: String ,required:true,trim:true},
  linkedin_url: { type: String, required:true, trim:true },
  is_del: { type: Boolean, default: false },
},
{timestamps:true}
);
const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
export default Testimonial;

