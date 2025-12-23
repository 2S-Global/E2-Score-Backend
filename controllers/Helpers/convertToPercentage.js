// helpers/convertToPercentage.js
export const convertToPercentage = (marks, gradingSystemId) => {
  const value = Number(marks);
  if (!value) return 0;

  switch (Number(gradingSystemId)) {
    case 1: // Scale 10 (CGPA)
      return +(value * 9.5).toFixed(2);

    case 5: // Scale 10 (DGPA)
      return +((value - 0.5) * 10).toFixed(2);

    case 2: // Scale 4
      return +(value * 25).toFixed(2);

    case 3: // % Marks
      return value;

    default:
      return value;
  }
};
