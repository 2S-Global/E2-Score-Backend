import mongoose from "mongoose";
import dotenv from "dotenv";
import { InstitueStudent } from "../models/InstitueStudentModel.js"; // Update path if needed

dotenv.config();

function toPascalCase(str) {
    if (!str) return str;

    return str
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function updateStudentNames() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Connected");

        const students = await InstitueStudent.find({});

        let updated = 0;

        for (const student of students) {
            const oldName = student.name;
            const newName = toPascalCase(oldName);

            if (oldName !== newName) {
                console.log(`${oldName} -> ${newName}`);

                await InstitueStudent.updateOne(
                    { _id: student._id },
                    { $set: { name: newName } }
                );

                updated++;
            }
        }

        console.log(`\n✅ Updated ${updated} student names.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
}

updateStudentNames();