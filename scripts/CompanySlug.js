import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import companylist from "../models/CompanyListModel.js"; // Adjust path if needed

dotenv.config();

const run = async () => {
  try {
    console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Database connected");

    /*  const cursor = companylist
      .find({
        slug: { $exists: false },
      })
      .cursor();

    const operations = [];
    const BATCH_SIZE = 1000;

    for await (const item of cursor) {
      operations.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              slug: slugify(item.companyname, {
                lower: true,
                strict: true,
                trim: true,
              }),
            },
          },
        },
      });

      if (operations.length === BATCH_SIZE) {
        await companylist.bulkWrite(operations);
        operations.length = 0;
      }
    }

    if (operations.length) {
      await companylist.bulkWrite(operations);
    }
 */

    const filter = {
      slug: { $exists: false },
    };

    const total = await companylist.countDocuments(filter);

    console.log(`Pending slugs: ${total}`);

    if (!total) {
      console.log("No migration needed");
      return;
    }

    const BATCH_SIZE = 500;
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    const operations = [];

    const cursor = companylist
      .find(filter)
      .select("_id companyname")
      .lean()
      .cursor();

    for await (const item of cursor) {
      try {
        // Skip null, missing, or empty companyname
        if (typeof item.companyname !== "string" || !item.companyname.trim()) {
          skipped++;
          console.log(`Skipped: ${item._id} (invalid companyname)`);
          continue;
        }

        const slug = slugify(item.companyname, {
          lower: true,
          strict: true,
          trim: true,
        });

        operations.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: { slug },
            },
          },
        });

        if (operations.length >= BATCH_SIZE) {
          await companylist.bulkWrite(operations, {
            ordered: false,
          });

          processed += operations.length;
          operations.length = 0;

          console.log(`Updated: ${processed}/${total}`);
        }
      } catch (err) {
        failed++;

        console.error(`Failed ${item._id}:`, err.message);
      }
    }

    if (operations.length) {
      await companylist.bulkWrite(operations, {
        ordered: false,
      });

      processed += operations.length;
    }

    console.log("Migration completed");
    console.log({
      updated: processed,
      skipped,
      failed,
    });
    console.log("Migration completed");
    console.log("✅ Database disconnected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
