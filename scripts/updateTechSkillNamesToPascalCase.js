import mongoose from "mongoose";
import dotenv from "dotenv";
import list_tech_skill from "../models/monogo_query/techSkillModel.js";

dotenv.config();

function toPascalCase(str) {
  if (!str || typeof str !== "string") return str;

  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Database connected");

    const docs = await list_tech_skill.find({});

    const bulkOps = docs.map((doc) => {
      const oldName = doc.name;
      const newName = toPascalCase(oldName);

      const oldLabel = doc.label;
      const newLabel = toPascalCase(oldLabel);

      console.log(`Name : ${oldName}  -->  ${newName}`);
      console.log(`Label: ${oldLabel}  -->  ${newLabel}`);
      console.log("--------------------------------");

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              name: newName,
              label: newLabel,
            },
          },
        },
      };
    });

    if (bulkOps.length) {
      const result = await list_tech_skill.bulkWrite(bulkOps);
      console.log(`\n✅ Updated ${result.modifiedCount} documents`);
    } else {
      console.log("No documents found.");
    }

    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();