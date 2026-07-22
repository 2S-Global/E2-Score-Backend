import mongoose from "mongoose";
import dotenv from "dotenv";
import companylist from "../models/CompanyListModel.js"; // Adjust path if needed

dotenv.config();

const run = async () => {
  try {
    console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Database connected");
    const filter = {
      slug: { $exists: false },
    };

    const total = await companylist.countDocuments(filter);

    console.log(`Pending slugs: ${total}`);
    /*     const cursor = companylist
      .aggregate([
        {
          $group: {
            _id: {
              $toLower: {
                $trim: {
                  input: "$companyname",
                },
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .allowDiskUse(true)
      .cursor({
        batchSize: 1000,
      });

    for await (const item of cursor) {
      console.log(item);
    } */
    //console.log("ssssssssss", duplicates);
    console.log("✅ Database disconnected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
