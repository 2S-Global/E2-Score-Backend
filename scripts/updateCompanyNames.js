import companylist from "../models/CompanyListModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("strictQuery", true);

function toPascalCase(str) {
  if (!str) return str;

  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
 

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected");

    const cursor = companylist.find({}).cursor();

    let updated = 0;

    for await (const company of cursor) {
      const oldName = company.companyname;
      const newName = toPascalCase(oldName);
        
      if (oldName !== newName) {
        await companylist.updateOne(
          { _id: company._id },
          { $set: { companyname: newName } }
        );

        updated++;
        console.log(`${oldName} -> ${newName}`);
      }
    }

    console.log(`✅ Updated ${updated} documents`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected");
  }
}

run();