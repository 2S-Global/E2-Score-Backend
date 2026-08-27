import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { generateFailedRequestsReport } from "../services/failedRequestsReportService.js";
import { sendFailedRequestsReportEmail } from "../services/failedRequestsReportEmail.js";


const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGODB_URI);
    console.log("DB connected successfully.");

    const testWindow = "EVENING_TO_NOON";
    console.log(`Generating report for window: ${testWindow}...`);
    
    const { pdfBuffer, failuresCount, from, to } = await generateFailedRequestsReport(testWindow);
    if (pdfBuffer) {
      console.log(`PDF generated successfully. Buffer length: ${pdfBuffer.length} bytes.`);
    } else {
      console.log("No failures found. Skipping PDF generation.");
    }
    console.log(`Total failures count in period: ${failuresCount}`);

    // Mock User.find to force email recipient to gamermohan39@gmail.com
    const originalFind = User.find;
    User.find = function (query, projection) {
      console.log("Mocked User.find queried for admins. Overriding to target recipient.");
      return {
        lean: () => Promise.resolve([{ email: "gamermohan39@gmail.com" }])
      };
    };

    console.log("Calling sendFailedRequestsReportEmail...");
    await sendFailedRequestsReportEmail(pdfBuffer, failuresCount, from, to);
    console.log("Email sent successfully!");

    // Restore original User.find
    User.find = originalFind;

    await mongoose.disconnect();
    console.log("DB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Test Script Error:", err);
    process.exit(1);
  }
};

run();
