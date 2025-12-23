import mongoose from "mongoose";
import dotenv from "dotenv";
import { calculateStudyPeriodScoreByUserId } from "../controllers/Helpers/calculateStudyPeriodScoreByUserId.js";

// Load .env
dotenv.config();

const TEST_USER_ID = "6937bc0115b0e2b4b04389fd"; // test userId

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected");

    const result = await calculateStudyPeriodScoreByUserId(TEST_USER_ID);

    console.log("===== STUDY PERIOD SCORE RESULT =====");
    console.log("Total Study Years:", result.totalStudyYears);
    console.log("Score:", result.score);
    console.log("Breakdown:", result.breakdown);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
};

runTest();
