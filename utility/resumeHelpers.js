import mongoose from "mongoose";

export const getFormattedDOB = (dob) => {
  if (!dob) return "";
  return new Date(dob).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export const createMap = (arr = [], key = "_id", val = "name") => {
  return arr.reduce((acc, item) => {
    if (item && item[key]) {
      acc[item[key].toString()] = item[val];
    }
    return acc;
  }, {});
};

export const formatCurrency = (amount, currency = "INR") => {
  if (!amount) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const sortByYearDesc = (items, endYearKey, startYearKey) => {
  return items.sort((a, b) => {
    const endA = a[endYearKey];
    const endB = b[endYearKey];

    // Ongoing/Present items come first
    if (!endA && endB) return -1;
    if (endA && !endB) return 1;

    if (endA !== endB) return (endB || 0) - (endA || 0);
    return (b[startYearKey] || 0) - (a[startYearKey] || 0);
  });
};

export const filterValidIds = (ids = []) => {
  return ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
};