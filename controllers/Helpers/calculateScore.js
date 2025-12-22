import mongoose from "mongoose";
import usereducation from "../../models/userEducationModel.js";
import { calculateEducationScore } from "./educationScoreCalculator.js";

/**
 * ONLY REQUIRED LEVELS
 */
const LEVEL_MAP = {
  1: "10th",
  2: "12th",
};

/**
 * STATIC year gap (as per your example)
 */
const YEAR_GAP_MAP = {
  1: 0, // 10th
  2: 1, // 12th
};

/**
 * MAIN FUNCTION
 * Pass only userId
 */
export const calculateEducationScoreByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // Fetch education records
  const educations = await usereducation
    .find({ userId, isDel: false })
    .sort({ level: 1 });

  if (!educations.length) {
    return {
      totalScore: 0,
      breakdown: [],
    };
  }

  /**
   * KEEP SAME STRUCTURE
   * percentage = marks (STRING)
   */
  const educationData = educations
    .filter((edu) => LEVEL_MAP[edu.level])
    .map((edu) => ({
      type: LEVEL_MAP[edu.level],
      percentage: edu.marks,
      yearGap: YEAR_GAP_MAP[edu.level],
    }));

  const result = calculateEducationScore(educationData);

  return {
    totalScore: result.totalScore,
    breakdown: result.breakdown,
    educationData, // optional for debug
  };
};
