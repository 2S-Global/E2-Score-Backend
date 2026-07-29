import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import list_university_univercities from "../models/monogo_query/universityUniversityModel.js";

dotenv.config();

const BATCH_SIZE = 500;

async function run() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Database connected");

    const filter = {
      slug: { $exists: false },
    };

    const total = await list_university_univercities.countDocuments(filter);

    console.log(`Pending documents: ${total}`);

    if (total === 0) {
      console.log("No migration needed.");
      return;
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    let operations = [];

    const cursor = list_university_univercities
      .find(filter)
      .select("_id name")
      .lean()
      .cursor();

    for await (const item of cursor) {
      try {
        if (!item.name || typeof item.name !== "string") {
          skipped++;
          continue;
        }

        const slug = slugify(item.name, {
          lower: true,
          strict: true,
          trim: true,
        });

        operations.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                slug,
              },
            },
          },
        });

        if (operations.length >= BATCH_SIZE) {
          await list_university_univercities.bulkWrite(operations, {
            ordered: false,
          });

          processed += operations.length;
          console.log(`Updated ${processed}/${total}`);

          operations = [];
        }
      } catch (err) {
        failed++;
        console.error(`Failed ${item._id}`);
        console.error(err);
      }
    }

    if (operations.length > 0) {
      await list_university_univercities.bulkWrite(operations, {
        ordered: false,
      });

      processed += operations.length;
    }

    console.log("=================================");
    console.log("Migration Complete");
    console.table({
      Total: total,
      Updated: processed,
      Skipped: skipped,
      Failed: failed,
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  }
}

run();
