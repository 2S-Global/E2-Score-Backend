// helpers/calculateEducationScoreByUserId.js
import mongoose from "mongoose";
import usereducation from "../../models/userEducationModel.js";
import listGradingSystem from "../../models/monogo_query/gradingSystemModel.js";
import educationLevelMaster from "../../models/monogo_query/educationLevelModel.js";
import { convertToPercentage } from "./convertToPercentage.js";
import { calculateEducationScore } from "./educationScoreCalculator.js";

/**
 * School level mapping
 */
const SCHOOL_LEVEL_MAP = {
  1: { type: "10th", yearGap: 0 },
  2: { type: "12th", yearGap: 1 },
};

export const calculateEducationScoreByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const educations = await usereducation.find({ userId, isDel: false });
  if (!educations.length) {
    return { totalScore: 0, breakdown: [], educationData: [] };
  }

  /**
   * Fetch grading systems (KEPT)
   */
  const gradingSystems = await listGradingSystem.find({
    is_del: 0,
    is_active: 1,
  });

  const gradingMap = {};
  gradingSystems.forEach((g) => {
    gradingMap[g.id] = g.name;
  });

  /**
   * Fetch education level master
   */
  const levelMasters = await educationLevelMaster.find({
    is_del: 0,
    is_active: 1,
  });

  const levelMap = {};
  levelMasters.forEach((lvl) => {
    levelMap[String(lvl.id)] = lvl;
  });

  /**
   * Prepare data
   */
  const educationData = educations
    .map((edu) => {
      let percentage = 0;
      let type = null;
      let yearGap = 0;

      // ✅ 10th / 12th
      if (SCHOOL_LEVEL_MAP[edu.level]) {
        percentage = Number(edu.marks);
        type = SCHOOL_LEVEL_MAP[edu.level].type;
        yearGap = SCHOOL_LEVEL_MAP[edu.level].yearGap;
      } else {
        // ✅ Convert grading → %
        percentage = convertToPercentage(edu.marks, edu.gradingSystem);

        const master = levelMap[edu.level];
        if (!master) return null;

        yearGap = master.duration || 0;

        // 🎓 DIPLOMA
        if (edu.level === "3") {
          type = "3yrs_diploma";
        }

        // 🎓 UNDERGRADUATE
        else if (master.type === "UG") {
          if (master.duration === 3) type = "3yrs_graduation";
          if (master.duration === 4) type = "4yrs_graduation";
        }

        // 🎓 POSTGRADUATE
        else if (master.type === "PG") {
          if (master.duration === 1) type = "1yr_pg";
          if (master.duration === 2) type = "2yrs_pg";
          if (master.duration === 3) type = "3yrs_pg";
        }

        // 🎓 PhD
        else if (master.level?.toLowerCase().includes("doctorate")) {
          type = "phd";
        }
      }

      if (!type) return null;

      return {
        type,
        percentage,
        yearGap,
        gradingSystem: gradingMap[edu.gradingSystem] || null,
      };
    })
    .filter(Boolean);

  /**
   * Final calculation
   */
  const result = calculateEducationScore(educationData);

  return {
    totalScore: result.totalScore,
    breakdown: result.breakdown,
    educationData,
  };
};
