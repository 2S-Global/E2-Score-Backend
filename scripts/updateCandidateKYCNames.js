import mongoose from "mongoose";
import dotenv from "dotenv";
import CandidateKYC from "../models/CandidateKYCModel.js";

dotenv.config();

mongoose.set("strictQuery", true);

function toTitleCase(str) {
    if (!str || typeof str !== "string") return str;

    return str
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

async function updateKYCNames() {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB Connected");

        const records = await CandidateKYC.find();

        let updatedCount = 0;

        for (const record of records) {
            let changed = false;

            const fields = [
                "pan_name",
                "epic_name",
                "passport_name",
                "dl_name",
                "aadhar_name",
            ];

            for (const field of fields) {
                if (record[field]) {
                    const formatted = toTitleCase(record[field]);

                    if (formatted !== record[field]) {
                        record[field] = formatted;
                        changed = true;
                    }
                }
            }

            if (changed) {
                await record.save();
                updatedCount++;
                console.log(`Updated: ${record._id}`);
            }
        }

        console.log(`\nDone! Updated ${updatedCount} documents.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
}

updateKYCNames();