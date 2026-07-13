import mongoose from "mongoose";
import dotenv from "dotenv";
import list_university_course from "../models/monogo_query/universityCourseModel.js"; // Update path if needed

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

async function updateUniversityCourseNames() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    const courses = await list_university_course.find({});

    let updated = 0;

    for (const course of courses) {
      const oldName = course.name;
      const newName = toPascalCase(oldName);

      if (oldName !== newName) {
        console.log(`${oldName} -> ${newName}`);

        await list_university_course.updateOne(
          { _id: course._id },
          {
            $set: {
              name: newName,
            },
          }
        );

        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} course names.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  }
}

updateUniversityCourseNames();