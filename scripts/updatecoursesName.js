import mongoose from "mongoose";
import dotenv from "dotenv";
import list_course_type from "../models/monogo_query/courseTypeModel.js";

dotenv.config();

mongoose.set("strictQuery", true);

function toTitleCase(str) {
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

        const cursor = list_course_type.find({}).cursor();

        let updated = 0;

        for await (const course of cursor) {
            const oldName = course.name;
            const newName = toTitleCase(oldName);

            if (oldName !== newName) {
                await list_course_type.updateOne(
                    { _id: course._id },
                    { $set: { name: newName } }
                );

                updated++;
                console.log(`${oldName} -> ${newName}`);
            }
        }

        console.log(`✅ Total Updated: ${updated}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected");
    }
}

run();