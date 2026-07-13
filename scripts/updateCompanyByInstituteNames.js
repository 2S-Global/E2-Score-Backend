import mongoose from "mongoose";
import dotenv from "dotenv";
import CompanyByInstitute from "../models/CompanyByInstituteModel.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

function toPascalCase(str) {
  if (!str) return str;

  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function updateCompanyNames() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB Connected");

    const companies = await CompanyByInstitute.find({});

    console.log(`Found ${companies.length} companies\n`);

    let updated = 0;

    for (const company of companies) {
      const oldName = company.companyName;
      const newName = toPascalCase(oldName);

      if (oldName !== newName) {
        console.log(`${oldName}  -->  ${newName}`);

        company.companyName = newName;
        await company.save();

        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} company names.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

updateCompanyNames();