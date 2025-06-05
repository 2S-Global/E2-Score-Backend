const getMonthName = (monthNumber) => {
  const monthIndex = parseInt(monthNumber, 10) - 1;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthIndex] || ""; // Return empty string if invalid
};
