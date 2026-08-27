import Employment from "../models/Employment.js";
import CandidateDetails from "../models/CandidateDetailsModel.js";

export const convertMonthsToYearsAndMonths = (totalMonths) => {
  if (!totalMonths || totalMonths < 0) {
    return { years: 0, months: 0 };
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months };
};

export const calculateTotalExperience = async (userId) => {
  const employments = await Employment.find({ user: userId, isDel: false });

  const intervals = [];
  let fallbackMonths = 0;

  const today = new Date();
  // Using local or UTC depends on system consistency, here we align with the dob UTC year style
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1; // 1-indexed

  for (const emp of employments) {
    const sYear = Number(emp.joiningDate?.year) || 0;
    const sMonth = Number(emp.joiningDate?.month) || 0;

    let eYear = 0;
    let eMonth = 0;

    if (emp.currentEmployment) {
      eYear = currentYear;
      eMonth = currentMonth;
    } else {
      eYear = Number(emp.leavingDate?.year) || 0;
      eMonth = Number(emp.leavingDate?.month) || 0;
    }

    if (sYear > 0 && sMonth > 0 && eYear > 0 && eMonth > 0) {
      const startTotal = sYear * 12 + sMonth;
      const endTotal = eYear * 12 + eMonth;
      if (endTotal >= startTotal) {
        intervals.push({ start: startTotal, end: endTotal });
      }
    } else {
      // Fallback: If no joining/leaving dates are defined, sum their manually inputted experience
      const expYears = Number(emp.totalExperience?.year) || 0;
      const expMonths = Number(emp.totalExperience?.month) || 0;
      fallbackMonths += (expYears * 12) + expMonths;
    }
  }0

  // Sort intervals by start month ascending
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping or contiguous intervals
  const merged = [];
  for (const interval of intervals) {
    if (merged.length === 0) {
      merged.push({ ...interval });
    } else {
      const last = merged[merged.length - 1];
      // Contiguous (last.end + 1) or overlapping (last.end) are merged
      if (interval.start <= last.end + 1) {
        last.end = Math.max(last.end, interval.end);
      } else {
        merged.push({ ...interval });
      }
    }
  }

  
  let mergedMonths = 0;
  for (const interval of merged) {
    mergedMonths += (interval.end - interval.start + 1);
  }

  const totalMonths = mergedMonths + fallbackMonths;

  // Convert to years and months
  const { years, months } = convertMonthsToYearsAndMonths(totalMonths);

  return {
    years,
    months,
    totalMonths
  };
};

export const syncCandidateExperience = async (userId) => {
  if (!userId) return null;

  const { years, months } = await calculateTotalExperience(userId);

  const updatedDetails = await CandidateDetails.findOneAndUpdate(
    { userId },
    {
      $set: {
        "totalExperience.year": years.toString(),
        "totalExperience.month": months.toString(),
        updatedAt: new Date()
      }
    },
    { new: true, upsert: true }
  );

  return updatedDetails;
};
