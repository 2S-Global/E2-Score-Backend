import mongoose from "mongoose";
import dotenv from "dotenv";
import { calculateEducationScoreByUserId } from "../controllers/Helpers/calculateScore.js";

// 👆 adjust path if needed

// Load environment variables
dotenv.config();

const run = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected");

    // 🔹 PASS USER ID HERE
    const userId = "6937bc0115b0e2b4b04389fd";

    // Call function
    const result = await calculateEducationScoreByUserId(userId);

    console.log("====== RESULT ======");
    console.log("Total Score:", result.totalScore);
    console.log("Breakdown:", result.breakdown);
    console.log("Education Data:", result.educationData);

    // Disconnect DB
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();
