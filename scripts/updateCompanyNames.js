import companylist from "../models/CompanyListModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("strictQuery", true);

const BATCH_SIZE = 1000;

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

        const cursor = companylist.find({}).lean().cursor();

        let operations = [];
        let checked = 0;
        let modified = 0;

        for await (const company of cursor) {
            checked++;

            const newName = toPascalCase(company.companyname);

            if (company.companyname !== newName) {
                operations.push({
                    updateOne: {
                        filter: { _id: company._id },
                        update: {
                            $set: {
                                companyname: newName,
                            },
                        },
                    },
                });
            }

            if (operations.length >= BATCH_SIZE) {
                const result = await companylist.bulkWrite(operations, {
                    ordered: false,
                });

                modified += result.modifiedCount;
                console.log(
                    `Checked: ${checked.toLocaleString()} | Updated: ${modified.toLocaleString()}`
                );

                operations = [];
            }
        }

        if (operations.length) {
            const result = await companylist.bulkWrite(operations, {
                ordered: false,
            });

            modified += result.modifiedCount;
        }

        console.log("\n========== FINISHED ==========");
        console.log(`Checked : ${checked.toLocaleString()}`);
        console.log(`Updated : ${modified.toLocaleString()}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected");
    }
}

run();