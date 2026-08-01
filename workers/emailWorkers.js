import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { emailHandlers } from "../services/email/handlers/emailHandlers.js";

// Main Processor Callback

const processEmailJob = async (job) => {

    const handler = emailHandlers[job.name];

    if (!handler) {
        console.warn(`[EmailWorker] Unhandled job type received: ${job.name}`);
        return;
    }

    await handler(job);
};

export const emailWorker = new Worker("email", processEmailJob, {
    connection: redis,
    concurrency: 10, //MAX 10 CONCUREENT REQUESTS
});





//CHECKERS
emailWorker.on("completed", (job) => {
    console.log(`[EmailWorker] Job ${job.id} (${job.name}) completed successfully`);
});

emailWorker.on("failed", (job, error) => {
    console.error(
        `[EmailWorker] Job ${job?.id || "unknown"} (${job?.name}) failed:`,
        error.message
    );
});

// Graceful Shutdown Handler
const shutdown = async () => {
    console.log("Shutting down Email Worker...");
    await emailWorker.close();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);