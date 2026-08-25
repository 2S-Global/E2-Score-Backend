import db from "../config/db.js";
import User from "../models/userModel.js";
import ExternalApiLog from "../models/ExternalApiLogModel.js";
import { generateFailedRequestsReport } from "../services/failedRequestsReportService.js";
import { sendFailedRequestsReportEmail } from "../services/failedRequestsReportEmail.js";
import fs from "fs";

(async () => {
    try {
        await db();
        console.log("DB connected.");
        const { pdfBuffer, failuresCount } = await generateFailedRequestsReport(24);
        console.log(`Report generated. Count: ${failuresCount}`);
        fs.writeFileSync("scripts/test_report.pdf", pdfBuffer);
        console.log("PDF saved to scripts/test_report.pdf");

        console.log("Sending email test...");
        await sendFailedRequestsReportEmail(pdfBuffer, failuresCount, 24);
        console.log("Email test complete.");

        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
})();
