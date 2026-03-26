import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema({
  url: { type: String,required:true,trim:true },
  image: { type: String,default:null },
  is_del: { type: Boolean, default: false },
},
{timestamps:true}
);
const Client = mongoose.model("Client", ClientSchema);
export default Client;

