import mongoose from "mongoose";
import dotenv from "dotenv";
import { calculateEducationGapPenalty } from "../controllers/Helpers/calculateGap.js";

// Load env variables
dotenv.config();

const run = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ DB connected");

    // 🔹 PASS USER ID HERE
    const userId = "6948f31cb5fd9d7c8ae88bcd";

    // 🔹 Run calculation
    const result = await calculateEducationGapPenalty(userId);

    console.log("📊 Education Gap Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error running test:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 DB disconnected");
    process.exit(0);
  }
};

run();
