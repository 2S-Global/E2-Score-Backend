export const validateEducationInput = async (data, userId, currentRecordId = null) => {
  const levelId = String(data.level || "");
  const currentYear = new Date().getFullYear();

  // 1. Marks Validation
  if (data.marks !== undefined && data.marks !== null && data.marks !== "") {
    const marksNum = Number(data.marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      return "Marks percentage must be between 0 and 100.";
    }
  }

  // 2. 10th & 12th Level Validations
  if (levelId === "1" || levelId === "2") {
    if (!data.board || !data.year_of_passing) {
      return "Board and Year of Passing are required.";
    }

    // For 12th (level 2), english and math marks are also required
    if (levelId === "2") {
      if (
        data.eng_marks === undefined ||
        data.eng_marks === null ||
        data.eng_marks === "" ||
        data.math_marks === undefined ||
        data.math_marks === null ||
        data.math_marks === ""
      ) {
        return "English marks and Math marks are required for 12th grade.";
      }

      const engNum = Number(data.eng_marks);
      const mathNum = Number(data.math_marks);

      if (isNaN(engNum) || engNum < 0 || engNum > 100) {
        return "English marks must be a number between 0 and 100.";
      }
      if (isNaN(mathNum) || mathNum < 0 || mathNum > 100) {
        return "Math marks must be a number between 0 and 100.";
      }
    }

    const passingYear = Number(data.year_of_passing);
    if (isNaN(passingYear) || passingYear < 1950 || passingYear > currentYear) {
      return `Passing year must be between 1950 and ${currentYear}.`;
    }

    // Gap validation for 12th Grade
    if (levelId === "2") {
      const tenthRecord = await UserEducation.findOne({
        userId,
        level: "1",
        isDel: false,
        _id: { $ne: currentRecordId }, // Exclude current record on updates
      });
      if (tenthRecord?.year_of_passing) {
        const tenthYear = Number(tenthRecord.year_of_passing);
        if (passingYear < tenthYear + 2) {
          return `12th passing year (${passingYear}) must be at least 2 years after 10th passing year (${tenthYear}).`;
        }
      }
    } 
    // Gap validation for 10th Grade
    else if (levelId === "1") {
      const twelfthRecord = await UserEducation.findOne({
        userId,
        level: "2",
        isDel: false,
        _id: { $ne: currentRecordId },
      });
      if (twelfthRecord?.year_of_passing) {
        const twelfthYear = Number(twelfthRecord.year_of_passing);
        if (passingYear > twelfthYear - 2) {
          return `10th passing year (${passingYear}) must be at least 2 years prior to 12th passing year (${twelfthYear}).`;
        }
      }
    }
  } 
  // 3. Higher Education Validations
  else {
    if (
      !data.university ||
      !data.institute_name ||
      !data.course_name ||
      !data.start_year ||
      !data.end_year
    ) {
      return "University, Institute, Course, Start Year, and End Year are required.";
    }

    const startYear = Number(data.start_year);
    const endYear = Number(data.end_year);

    if (isNaN(startYear) || isNaN(endYear)) {
      return "Start and End years must be valid numbers.";
    }

    if (startYear < 1950 || startYear > currentYear + 6) {
      return "Invalid start year.";
    }

    if (endYear < startYear) {
      return "End year cannot be earlier than start year.";
    }

    // Compare with 12th passing year
    const twelfthRecord = await UserEducation.findOne({
      userId,
      level: "2",
      isDel: false,
      _id: { $ne: currentRecordId },
    });
    if (twelfthRecord?.year_of_passing) {
      const twelfthYear = Number(twelfthRecord.year_of_passing);
      if (startYear < twelfthYear) {
        return `College start year (${startYear}) cannot be earlier than 12th passing year (${twelfthYear}).`;
      }
    }
  }

  return null; // Null means validation passed
};