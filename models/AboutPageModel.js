import mongoose from "mongoose";
const AboutSchema = new mongoose.Schema({
  title: { type: String,required:true,trim:true },
  description: { type: String ,required:true},
  image: { type: String,default:null },
},
{timestamps:true}
);
const AboutPage = mongoose.model("AboutPage", AboutSchema);
export default AboutPage;
