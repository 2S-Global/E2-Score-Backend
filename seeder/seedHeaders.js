import db from "../config/db.js";
import MentalTestHeaderModel from "../models/MentalTestHeaderModel.js";

const seed = async () => {
  await db();
  const headers = [
    { header: "Emotional Well-being" },
    { header: "Stress & Anxiety" },
    { header: "Self-Confidence" },
    { header: "Social & Relationship Health" },
    { header: "Overall Mental Wellness" },
  ];
  try {
    await MentalTestHeaderModel.insertMany(headers);
    console.log("Headers inserted successfully");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
};
seed();
