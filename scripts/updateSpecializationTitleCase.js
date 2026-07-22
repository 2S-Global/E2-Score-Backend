import mongoose from "mongoose";
import dotenv from "dotenv";
import JobPosting from "../models/company_Models/JobPostingModel.js";

dotenv.config();

const BATCH_SIZE = 1000;

function toTitleCase(str) {
    if (!str || typeof str !== "string") return str;

    return str
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function updateJobSkillsTitleCase() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Connected");

        const cursor = JobPosting.find({
            jobSkills: { $exists: true, $ne: [] },
        })
            .select("_id jobSkills")
            .lean()
            .cursor();

        let operations = [];
        let checked = 0;
        let updated = 0;

        for await (const doc of cursor) {
            checked++;

            const updatedJobSkills = doc.jobSkills.map(toTitleCase);

            const isChanged =
                JSON.stringify(updatedJobSkills) !==
                JSON.stringify(doc.jobSkills);

            if (isChanged) {
                operations.push({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: {
                            $set: {
                                jobSkills: updatedJobSkills,
                            },
                        },
                    },
                });

                updated++;
            }

            if (operations.length >= BATCH_SIZE) {
                await JobPosting.bulkWrite(operations);
                operations = [];

                console.log(
                    `Checked: ${checked.toLocaleString()} | Updated: ${updated.toLocaleString()}`
                );
            }
        }

        if (operations.length) {
            await JobPosting.bulkWrite(operations);
        }

        console.log("\n🎉 Done!");
        console.log(`Total Checked: ${checked.toLocaleString()}`);
        console.log(`Total Updated: ${updated.toLocaleString()}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
}

updateJobSkillsTitleCase();