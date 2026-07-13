import mongoose from "mongoose";
import dotenv from "dotenv";
import list_key_skill from "../models/monogo_query/keySkillModel.js"; // <-- adjust path if needed

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

    const docs = await list_key_skill.find({})

    const bulkOps = docs.map((doc) => {
      const oldSkill = doc.Skill;
      const newSkill = toPascalCase(oldSkill);

      console.log(`${oldSkill}  -->  ${newSkill}`);

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              Skill: newSkill,
            },
          },
        },
      };
    });

    if (bulkOps.length) {
      const result = await list_key_skill.bulkWrite(bulkOps);
      console.log(`\n✅ Updated ${result.modifiedCount} documents`);
    }

    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();