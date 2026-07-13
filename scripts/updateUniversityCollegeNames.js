import mongoose from "mongoose";
import dotenv from "dotenv";
import list_university_colleges from "../models/monogo_query/universityCollegesModel.js";

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

async function updateUniversityCollegeNames() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    const colleges = await list_university_colleges.find({});

    let updated = 0;

    for (const college of colleges) {
      const oldName = college.name;
      const newName = toPascalCase(oldName);

      if (oldName !== newName) {
        console.log(`${oldName}  ->  ${newName}`);

        await list_university_colleges.updateOne(
          { _id: college._id },
          {
            $set: {
              name: newName,
            },
          }
        );

        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} college names.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

updateUniversityCollegeNames();