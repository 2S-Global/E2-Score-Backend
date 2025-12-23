import mongoose from "mongoose";
import usereducation from "../../models/userEducationModel.js";

/**
 * LEVEL → STUDY YEARS
 * (based on your master data)
 */
const LEVEL_YEAR_MAP = {
  1: 10, // 10th
  2: 2, // 12th
  3: 3, // Diploma
  4: 3, // UG (3 years)
  5: 4, // UG (4 years)
  7: 2, // PG
};

/**
 * TOTAL STUDY PERIOD → SCORE
 */
const getStudyScore = (totalYears) => {
  if (totalYears >= 16) return 10;
  if (totalYears === 15) return 9;
  if (totalYears === 14) return 8;
  if (totalYears === 13) return 7;
  if (totalYears === 12) return 6;
  if (totalYears === 11) return 5;
  if (totalYears === 10) return 4;
  if (totalYears >= 8) return 3;
  return 0;
};

/**
 * MAIN FUNCTION
 * 🔹 Pass ONLY userId
 */
export const calculateStudyPeriodScoreByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // Fetch user education records
  const educations = await usereducation.find({
    userId,
    isDel: false,
  });

  if (!educations.length) {
    return {
      totalStudyYears: 0,
      score: 0,
      breakdown: [],
    };
  }

  let totalStudyYears = 0;
  let has10th = false;
  const breakdown = [];

  educations.forEach((edu) => {
    const level = Number(edu.level);
    let years = 0;

    // Count 10th only once
    if (level === 1) {
      if (!has10th) {
        years = 10;
        has10th = true;
      }
    } else {
      years = LEVEL_YEAR_MAP[level] || 0;
    }

    totalStudyYears += years;

    breakdown.push({
      level: edu.level,
      yearsAdded: years,
    });
  });

  const score = getStudyScore(totalStudyYears);

  return {
    totalStudyYears,
    score,
    breakdown,
  };
};
