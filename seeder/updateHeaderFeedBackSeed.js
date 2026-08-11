import db from "../config/db.js";
import mongoose from "mongoose";
import MentalTestFeedBackModel from "../models/MentalTestFeedBackModel.js";

const updateHeaderFeedBack = async () => {
  console.log("Connecting to the database...");
  await db();

  try {
    const headerId = "6a71cc1d4b85dc241cc21a62";
    
    const questions = [
      {
        _id: new mongoose.Types.ObjectId("6a797a42044ed72233edc17d"),
        text: "I am full of ideas.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797a67044ed72233edc183"),
        text: "I have difficulty understanding abstract ideas.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797a99044ed72233edc189"),
        text: "I have a vivid imagination.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797aaa044ed72233edc18f"),
        text: "I am not interested in abstract ideas.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797ab7044ed72233edc195"),
        text: "I spend time reflecting on things.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797ac8044ed72233edc19b"),
        text: "I do not have a good imagination.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797ad8044ed72233edc1a1"),
        text: "I am quick to understand complex concepts.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797ae6044ed72233edc1a7"),
        text: "I avoid philosophical or theoretical discussions.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797af6044ed72233edc1ad"),
        text: "I enjoy finding creative solutions to traditional problems.",
        is_reversed: false
      },
      {
        _id: new mongoose.Types.ObjectId("6a797b06044ed72233edc1b3"),
        text: "I am uncomfortable with rapid changes in process or direction.",
        is_reversed: false
      }
    ];

    console.log(`Updating/Creating feedback questions for header: ${headerId}...`);

    const result = await MentalTestFeedBackModel.findOneAndUpdate(
      { header: headerId, is_del: false },
      {
        $set: {
          questions: questions,
          updatedAt: new Date()
        },
        $setOnInsert: {
          header: headerId,
          is_del: false,
          createdAt: new Date(),
          __v: 0
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log("Successfully updated the feedback document!");
    console.log("Updated document:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Failed to update feedback data:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

updateHeaderFeedBack();
