import mongoose from "mongoose";
import dotenv from "dotenv";
import list_university_state from "../models/monogo_query/universityStateModel.js"; // Update path if needed

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

async function updateUniversityStateNames() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    const states = await list_university_state.find({});

    let updated = 0;

    for (const state of states) {
      const oldName = state.name;
      const newName = toPascalCase(oldName);

      if (oldName !== newName) {
        console.log(`${oldName} -> ${newName}`);

        await list_university_state.updateOne(
          { _id: state._id },
          {
            $set: {
              name: newName,
            },
          }
        );

        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} state names.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  }
}

updateUniversityStateNames();