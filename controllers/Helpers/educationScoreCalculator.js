import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulesPath = path.join(__dirname, "../../config/educationScoreRules.json");
const rules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));

export const calculateEducationScore = (exams = []) => {
  let totalScore = 0;
  let breakdown = [];

  for (const exam of exams) {
    const { type, percentage, yearGap = 0 } = exam;

    if (!rules.examTypes.includes(type)) continue;

    const scoreRule = rules.percentageScoreMap.find(
      r => percentage >= r.min && percentage <= r.max
    );

    let examScore = scoreRule ? scoreRule.score : 0;

    if (yearGap > 0) {
      examScore += yearGap * rules.yearGapPenalty;
    }

    examScore = Math.max(0, examScore);

    totalScore += examScore;

    breakdown.push({
      examType: type,
      percentage,
      yearGap,
      score: examScore
    });
  }

  return { totalScore, breakdown };
};
