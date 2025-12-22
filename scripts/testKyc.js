import mongoose from "mongoose";
import dotenv from "dotenv";
import kycCalculation from "../controllers/Helpers/kycCalculation.js";

// Load .env
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected");

    const userId = "69413d613d6b15ee92c0a6d6"; // existing userId

    const result = await kycCalculation(userId);
    console.log("KYC RESULT:", result);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();
