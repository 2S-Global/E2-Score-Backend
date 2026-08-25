import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { generateFailedRequestsReport } from "../services/failedRequestsReportService.js";
import { sendFailedRequestsReportEmail } from "../services/failedRequestsReportEmail.js";

const worker = new Worker(
    "reportGeneration",

    async (job) => {
        if (job.name !== "generate-failed-request-report") {
            return;
        }

        console.log("Generating failed request report...");

        const { window } = job.data;

        try {
            const { pdfBuffer, failuresCount, from, to } = await generateFailedRequestsReport(window);
            console.log(`PDF generated successfully. File size: ${pdfBuffer.length} bytes`);

            await sendFailedRequestsReportEmail(pdfBuffer, failuresCount, from , to);
            console.log("Email with PDF report sent successfully.");

            return {
                records: failuresCount,
                generatedAt: new Date(),
            };
        } catch (error) {
            console.error("Failed to complete report generation/emailing:", error.message);
            throw error;
        }
    },

    {
        connection: redis,
        concurrency: 1,
    }
);

worker.on("completed", (job, result) => {
    console.log(`Report job ${job.id} completed. Generated ${result?.records || 0} records.`);
});

worker.on("failed", (job, error) => {
    console.error(
        `Report job ${job?.id} failed:`,
        error.message
    );
});

export default worker;